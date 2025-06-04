# This lambda function periodically checks for tasks nearing their deadlines.
# It scans the DynamoDB 'TaskTable' for tasks that are not yet 'Completed'
# and whose deadlines are within the next hour.
# For each task meeting these criteria, it publishes an alert message to an SNS topic.
# This function is typically triggered by an Amazon EventBridge scheduled rule (e.g., hourly).

import boto3
import os
from datetime import datetime, timedelta
import json

ddb = boto3.resource('dynamodb')
sns = boto3.client('sns')
table = ddb.Table(os.environ['TASK_TABLE'])
TOPIC_ARN = os.environ['NOTIFICATION_TOPIC_ARN']

def handler(event, context):
    now = datetime.now(datetime.UTC)
    soon = (now + timedelta(hours=1)).isoformat()

    response = table.scan()
    alerts = []

    for task in response['Items']:
        if task['status'] != 'Completed' and task['deadline'] <= soon:
            message = f"Task '{task['description']}' assigned to {task['assignedTo']} is nearing its deadline."
            alerts.append(message)
            sns.publish(TopicArn=TOPIC_ARN, Message=message)

    return {
        'statusCode': 200,
        'body': json.dumps({'alertsSent': alerts})
    }
