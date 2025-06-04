# This lambda function serves as the primary handler for task management operations via API Gateway.
# It supports creating, listing, and updating tasks stored in Amazon DynamoDB.
#
# Key functionalities:
# - GET /tasks: Lists tasks. Admins can see all tasks; regular users see only tasks assigned to them.
# - POST /tasks: Creates a new task. Admin-only. Verifies the assigned user in Cognito and sends an email notification.
# - PUT /tasks: Updates an existing task. Admins or the assigned user can update. Triggers an SNS notification on status change.
#
# Authorization is handled via Cognito User Pools, leveraging user claims and group memberships.
# It integrates with the `notifications` module for sending emails and SNS messages.

import json
import boto3
import os
import uuid
from datetime import datetime, timezone
from botocore.exceptions import ClientError
import notifications

ddb = boto3.resource('dynamodb')
table = ddb.Table(os.environ['TASK_TABLE'])
USER_POOL_ID = os.environ.get('USER_POOL_ID') 


ses_client = None 
sns_client = None 
cognito_client = boto3.client('cognito-idp')


DEFAULT_CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS'
}

def handler(event, context):
    http_method = event['httpMethod']
    if http_method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': DEFAULT_CORS_HEADERS,
            'body': json.dumps({'message': 'CORS preflight successful'})
        }

    claims = event['requestContext']['authorizer']['claims']
    username = claims['cognito:username'] 
    sub = claims['sub'] 
    groups = claims.get('cognito:groups', [])

    if http_method == 'GET':
        response = list_tasks(username, sub, groups) 
    elif http_method == 'POST':
        response = create_task(json.loads(event['body']), username, groups) 
    elif http_method == 'PUT':
        response = update_task(json.loads(event['body']), username, sub, groups) 
    else:
        response = {
            'statusCode': 405,
            'body': json.dumps({'error': 'Method Not Allowed'})
        }
    
    response['headers'] = response.get('headers', {})
    response['headers'].update(DEFAULT_CORS_HEADERS)
    return response

def list_tasks(requesting_username, requesting_user_sub, groups):
    is_admin = 'admin' in groups

    if is_admin:
        response = table.scan()
    else:
        # Users can only see tasks assigned to them (using their sub)
        response = table.scan(
            FilterExpression='assignedTo = :user_sub',
            ExpressionAttributeValues={':user_sub': requesting_user_sub}
        )

    return {
        'statusCode': 200,
        'body': json.dumps(response['Items'])
    }

def create_task(data, created_by_username, groups):
    if 'admin' not in groups:
        return {
            'statusCode': 403,
            'body': json.dumps({'error': 'Unauthorized. Only admins can create tasks.'})
        }

    assigned_to_sub = data.get('assignedTo') 
    if not assigned_to_sub:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'assignedTo (user sub) is required'})
        }

    # 1 - Verify user exists and has an email using list_users with a filter
    user_email = None
    actual_username_for_task = None 
    try:
        response = cognito_client.list_users(
            UserPoolId=USER_POOL_ID,
            Filter=f'sub = "{assigned_to_sub}"' 
        )
        
        if response['Users'] and len(response['Users']) == 1:
            user_profile = response['Users'][0]
            actual_username_for_task = user_profile['Username']
            user_email = next((attr['Value'] for attr in user_profile['Attributes'] if attr['Name'] == 'email'), None)
            
            if not user_email:
                print(f"User sub: {assigned_to_sub} (Username: {actual_username_for_task}) does not have an email address.")
                return {
                    'statusCode': 400,
                    'body': json.dumps({'error': f'Assigned user (sub: {assigned_to_sub}) does not have an email address.'})
                }
        else:
            # User not found or multiple users found (all subs are unique but just to be safe)
            print(f"User with sub: {assigned_to_sub} not found or ambiguous.")
            return {
                'statusCode': 404, 
                'body': json.dumps({'error': f'Assigned user (sub: {assigned_to_sub}) not found.'})
            }

    except ClientError as e:
        # Handle other specific Cognito errors if necessary, or general ClientError
        print(f"ClientError verifying user {assigned_to_sub}: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f'Error verifying assigned user: {str(e)}'})
        }
    except Exception as e: 
        print(f"Unexpected error verifying user {assigned_to_sub}: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f'Unexpected error verifying assigned user: {str(e)}'})
        }

    # 2. Create the task item in DynamoDB
    item = {
        'taskId': str(uuid.uuid4()),
        'assignedTo': assigned_to_sub,
        'status': 'New',
        'deadline': data['deadline'],
        'description': data['description'],
        'createdBy': created_by_username, 
        'createdAt': datetime.now(timezone.utc).isoformat(),
        'updatedAt': datetime.now(timezone.utc).isoformat(),
    }
    
    try:
        table.put_item(Item=item)
    except Exception as e:
        print(f"Error creating task in DynamoDB: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Could not create task in database.'})
        }


    if user_email:
        notifications.send_task_assignment_email(
            recipient_email=user_email,
            task_description=item['description'],
            task_deadline=item['deadline'],
            assignee_username=actual_username_for_task
        )
    # SENDER_EMAIL_ADDRESS check is now handled within notifications.py

    return {
        'statusCode': 201,
        'body': json.dumps(item)
    }

def update_task(data, updated_by_username, updated_by_sub, groups):
    task_id = data.get('taskId')
    new_status = data.get('status')

    if not task_id or not new_status:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'taskId and status are required'})
        }

    # Get the existing task
    try:
        current_task_response = table.get_item(Key={'taskId': task_id})
        current_task = current_task_response.get('Item')
    except Exception as e:
        print(f"Error getting task: {e}")
        return {'statusCode': 500, 'body': json.dumps({'error': 'Could not retrieve task'})}

    if not current_task:
        return {
            'statusCode': 404,
            'body': json.dumps({'error': 'Task not found'})
        }

    # Authorization: Admin or the person assigned to the task can update it
    is_admin = 'admin' in groups
    assigned_to_sub_of_task = current_task.get('assignedTo')

    if not is_admin and assigned_to_sub_of_task != updated_by_sub:
        return {
            'statusCode': 403,
            'body': json.dumps({'error': 'Unauthorized. You can only update tasks assigned to you.'})
        }

    old_status = current_task.get('status')
    current_task['status'] = new_status
    current_task['updatedAt'] = datetime.now(timezone.utc).isoformat()
    
    try:
        table.put_item(Item=current_task)
    except Exception as e:
        print(f"Error updating task in DDB: {e}")
        return {'statusCode': 500, 'body': json.dumps({'error': 'Could not update task'})}

    if new_status != old_status:
        # Call the refactored SNS notification function
        notifications.send_status_update_notification(
            task_id=task_id,
            task_description=current_task['description'],
            old_status=old_status,
            new_status=new_status,
            updated_by_username=updated_by_username,
            assigned_to_sub_of_task=assigned_to_sub_of_task
        )
        # NOTIFICATION_TOPIC_ARN check is now handled within notifications.py
            
    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Task updated successfully', 'updatedTask': current_task})
    }

