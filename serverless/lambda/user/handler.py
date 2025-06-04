# This lambda function serves as a backend handler for user management within the Amazon Cognito User Pool.
# It processes incoming API Gateway requests to perform two main operations:
#
# 1. GET Request (List Users)
#    - Allows administrators to retrieve a comprehensive list of all users within the Cognito User Pool.
#    - For each user, it fetches their attributes (email) and the groups they belong to.
#    - Requires 'admin' group membership for authorization.
#
# 2. POST Request (Create User)
#    - Enables administrators to create new users in the Cognito User Pool.
#    - Expects a JSON body containing 'username' and 'email' (mandatory), and an optional 'temporaryPassword'.
#    - New users are automatically assigned to the 'member' Cognito group.
#    - A temporary password is set, and the Cognito service sends a welcome email with this password (and a login link, if configured in the User Pool settings).
#    - Requires 'admin' group membership for authorization.
#
# Both operations include CORS headers in their responses to allow cross-origin requests.

import json
import boto3
import os

cognito_client = boto3.client('cognito-idp')
USER_POOL_ID = os.environ['USER_POOL_ID']

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
    groups = claims.get('cognito:groups', [])

    if 'admin' not in groups:
        return {
            'statusCode': 403,
            'body': json.dumps({'error': 'Unauthorized. Only admins can list users.'}),
            'headers': {
                'Access-Control-Allow-Origin': '*' 
            }
        }

    if http_method == 'POST':
        if 'admin' not in groups:
            return {
                'statusCode': 403,
                'body': json.dumps({'error': 'Unauthorized. Only admins can create users.'}),
                'headers': {
                    'Access-Control-Allow-Origin': '*'
                }
            }
        try:
            body = json.loads(event.get('body', '{}'))
            username = body.get('username')
            email = body.get('email')
            temp_password = body.get('temporaryPassword', 'TempPassword123!')
            if not username or not email:
                return {
                    'statusCode': 400,
                    'body': json.dumps({'error': 'username and email are required.'}),
                    'headers': {
                        'Access-Control-Allow-Origin': '*'
                    }
                }
            # Create the user
            create_response = cognito_client.admin_create_user(
                UserPoolId=USER_POOL_ID,
                Username=username,
                UserAttributes=[
                    {'Name': 'email', 'Value': email},
                    {'Name': 'email_verified', 'Value': 'true'}
                ],
                TemporaryPassword=temp_password,
                DesiredDeliveryMediums=['EMAIL']
            
            )
            # Add user to 'member' group
            cognito_client.admin_add_user_to_group(
                UserPoolId=USER_POOL_ID,
                Username=username,
                GroupName='member'
            )
            return {
                'statusCode': 201,
                'body': json.dumps({'message': f'User {username} created and added to member group.'}),
                'headers': {
                    'Access-Control-Allow-Origin': '*'
                }
            }
        except Exception as e:
            print(f"Error creating user: {e}")
            return {
                'statusCode': 500,
                'body': json.dumps({'error': str(e)}),
                'headers': {
                    'Access-Control-Allow-Origin': '*'
                }
            }

    try:
        response = cognito_client.list_users(
            UserPoolId=USER_POOL_ID
        )
        
        users = []
        for user in response['Users']:
            user_attributes = {attr['Name']: attr['Value'] for attr in user['Attributes']}
            
            # Get user groups
            user_groups_response = cognito_client.admin_list_groups_for_user(
                Username=user['Username'],
                UserPoolId=USER_POOL_ID
            )
            groups_list = [group['GroupName'] for group in user_groups_response['Groups']]

            users.append({
                'username': user['Username'],
                'attributes': user_attributes,
                'enabled': user['Enabled'],
                'userStatus': user['UserStatus'],
                'groups': groups_list
            })

        return {
            'statusCode': 200,
            'body': json.dumps(users),
            'headers': {
                'Access-Control-Allow-Origin': '*'
            }
        }
    except Exception as e:
        print(f"Error listing users: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)}),
            'headers': {
                'Access-Control-Allow-Origin': '*'
            }
        } 