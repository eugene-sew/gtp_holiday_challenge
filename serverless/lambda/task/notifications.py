# This module provides utility functions for sending various notifications related to task management.
# It leverages AWS SES (Simple Email Service) for sending task assignment emails and AWS SNS (Simple Notification Service) for status update notifications.
#
# Key functionalities include:
#
# 1. send_task_assignment_email(recipient_email, task_description, task_deadline, assignee_username)
#    - Sends an email to a specified recipient when a new task is assigned.
#    - Includes task description, deadline, and assignee's username in the email body.
#    - **Important Note:** If using AWS SES in sandbox mode (default for new accounts), emails can only be sent to and from verified email addresses or domains within SES. For production, you'll need to move out of the sandbox.
#
# 2. send_status_update_notification(task_id, task_description, old_status, new_status, updated_by_username, assigned_to_sub_of_task)
#    - Publishes a message to an SNS topic when a task's status changes.
#    - Provides details about the task ID, description, old and new statuses, and the user who updated it.
#    - Attempts to fetch a friendly username for the assigned user from Cognito for better readability in the notification.


import boto3
import os
from botocore.exceptions import ClientError

# Initialize clients and ENV VARS once when the module is loaded
SENDER_EMAIL_ADDRESS = os.environ.get('SENDER_EMAIL_ADDRESS')
NOTIFICATION_TOPIC_ARN = os.environ.get('NOTIFICATION_TOPIC_ARN')
USER_POOL_ID = os.environ.get('USER_POOL_ID') 

ses_client = None
if SENDER_EMAIL_ADDRESS:
    ses_client = boto3.client('ses')

sns_client = None
if NOTIFICATION_TOPIC_ARN:
    sns_client = boto3.client('sns')

cognito_client = None
if USER_POOL_ID:
    cognito_client = boto3.client('cognito-idp')

def send_task_assignment_email(recipient_email, task_description, task_deadline, assignee_username):
    if not ses_client:
        print("SES client not initialized or SENDER_EMAIL_ADDRESS not configured. Skipping email.")
        return False
    if not recipient_email:
        print("Recipient email not provided. Skipping email.")
        return False

    try:
        ses_client.send_email(
            Source=SENDER_EMAIL_ADDRESS,
            Destination={'ToAddresses': [recipient_email]},
            Message={
                'Subject': {'Data': 'New Task Assigned to You'},
                'Body': {
                    'Text': {'Data': f"Hello {assignee_username if assignee_username else 'User'},\n\n"
                                      f"A new task '{task_description}' has been assigned to you.\n"
                                      f"Deadline: {task_deadline}\n\nThank you."}
                }
            }
        )
        print(f"Sent task assignment email to {recipient_email} via notifications module.")
        return True
    except ClientError as e:
        print(f"SES ClientError sending email to {recipient_email} via notifications module: {e}")
    except Exception as e:
        print(f"Unexpected error sending email to {recipient_email} via notifications module: {e}")
    return False

def send_status_update_notification(task_id, task_description, old_status, new_status, updated_by_username, assigned_to_sub_of_task):
    if not sns_client:
        print("SNS client not initialized or NOTIFICATION_TOPIC_ARN not configured. Skipping SNS notification.")
        return False

    sns_message_subject = f'Task Status Updated: {task_description[:50]}'
    sns_message_body = f"Task Update: '{task_description}' (ID: {task_id}) status changed from '{old_status}' to '{new_status}' by user {updated_by_username}."

    if assigned_to_sub_of_task and cognito_client and USER_POOL_ID:
        try:
            # Try to get a more friendly username for the notification
            assigned_user_profile = cognito_client.admin_get_user(UserPoolId=USER_POOL_ID, Username=assigned_to_sub_of_task)
            assigned_username_for_notif = next((attr['Value'] for attr in assigned_user_profile['UserAttributes'] if attr['Name'] == 'preferred_username'), assigned_to_sub_of_task)
            sns_message_body += f" Task is assigned to: {assigned_username_for_notif} (sub: {assigned_to_sub_of_task})."
        except Exception as e_user:
            print(f"Could not fetch assigned user's username for SNS notification: {e_user}")
            sns_message_body += f" Task is assigned to sub: {assigned_to_sub_of_task}."
    elif assigned_to_sub_of_task:
         sns_message_body += f" Task is assigned to sub: {assigned_to_sub_of_task}."

    try:
        sns_client.publish(
            TopicArn=NOTIFICATION_TOPIC_ARN,
            Message=sns_message_body,
            Subject=sns_message_subject
        )
        print(f"Sent SNS notification for task {task_id} status change via notifications module.")
        return True
    except ClientError as e:
        print(f"SNS ClientError sending notification for task {task_id} via notifications module: {e}")
    except Exception as e:
        print(f"Unexpected error sending SNS notification for task {task_id} via notifications module: {e}")
    return False 