# This AWS CDK stack defines the infrastructure for the Holiday Task Management application.
# It provisions and configures various AWS resources, including:
#
# - DynamoDB Table: Stores task details.
# - Cognito User Pool: Manages user authentication, sign-up, and groups (admin, member).
# - API Gateway: Provides RESTful endpoints for task and user management, secured by Cognito Authorizer.
# - Lambda Functions: 
#   - `TaskHandler`: Handles CRUD operations for tasks, integrates with DynamoDB and sends notifications.
#   - `ListUsersHandler`: Manages Cognito user listing and creation.
#   - `DeadlineChecker`: Periodically checks task deadlines and sends alerts.
# - **SNS Topic**: Used for sending task assignment and status update notifications.
# - **EventBridge Rule**: Schedules the `DeadlineChecker` Lambda to run hourly.
#
# This stack sets up necessary IAM roles and permissions for Lambda functions to interact with other services,
# and configures CORS for API Gateway endpoints.

from aws_cdk import (
    Stack,
    Duration,
    aws_lambda as _lambda,
    aws_apigateway as apigw,
    aws_dynamodb as ddb,
    aws_iam as iam,
    aws_events as events,
    aws_events_targets as targets,
    aws_sns as sns,
    aws_sns_subscriptions as subs,
    aws_cognito as cognito,
    CfnOutput
)
from constructs import Construct

class HolidayStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # DynamoDB Table
        task_table = ddb.Table(self, "TaskTable",
            partition_key={"name": "taskId", "type": ddb.AttributeType.STRING},
            billing_mode=ddb.BillingMode.PAY_PER_REQUEST
        )

        # Cognito User Pool
        user_pool = cognito.UserPool(self, "UserPool",
            self_sign_up_enabled=True,
            sign_in_aliases=cognito.SignInAliases(username=True, email=True)
        )

        user_pool_client = cognito.UserPoolClient(self, "UserPoolClient",
            user_pool=user_pool
        )

        identity_pool = cognito.CfnIdentityPool(self, "IdentityPool",
            allow_unauthenticated_identities=False,
            cognito_identity_providers=[{
                "clientId": user_pool_client.user_pool_client_id,
                "providerName": user_pool.user_pool_provider_name,
                "serverSideTokenCheck": False
            }]
        )

        # Cognito Groups
        cognito.CfnUserPoolGroup(self, "AdminGroup",
            group_name="admin",
            user_pool_id=user_pool.user_pool_id
        )

        cognito.CfnUserPoolGroup(self, "MemberGroup",
            group_name="member",
            user_pool_id=user_pool.user_pool_id
        )
        
        # SNS Topic (Moved Up)
        topic = sns.Topic(self, "TaskNotifications")

        # Lambda for Task Handling
        task_function = _lambda.Function(self, "TaskHandler",
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="handler.handler",
            code=_lambda.Code.from_asset("lambda/task"),
            environment={
                "TASK_TABLE": task_table.table_name,
                "USER_POOL_ID": user_pool.user_pool_id,
                "NOTIFICATION_TOPIC_ARN": topic.topic_arn, 
                "SENDER_EMAIL_ADDRESS": "eugenesew4+hlab@gmail.com"
            }
        )

        task_table.grant_read_write_data(task_function)
        topic.grant_publish(task_function) 

        # Grant Cognito permissions to the Task Lambda
        task_function.add_to_role_policy(iam.PolicyStatement(
            actions=[
                "cognito-idp:AdminGetUser", 
                "cognito-idp:ListUsers"    
            ],
            resources=[user_pool.user_pool_arn]
        ))

        # Grant SES SendEmail permission to the Lambda
        task_function.add_to_role_policy(iam.PolicyStatement(
            actions=["ses:SendEmail", "ses:SendRawEmail"],
            resources=["*"] 
        ))

        # API Gateway with Cognito Authorizer
        api = apigw.RestApi(self, "TaskApi",
            rest_api_name="Holiday Task Management Lab"
        )

        authorizer = apigw.CognitoUserPoolsAuthorizer(self, "CognitoAuthorizer",
            cognito_user_pools=[user_pool]
        )

        tasks = api.root.add_resource("tasks")

# Enable CORS by adding an OPTIONS method
        tasks.add_method(
                "OPTIONS",
                apigw.MockIntegration(
                    integration_responses=[{
                        'statusCode': '200',
                        'responseParameters': {
                            'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
                            'method.response.header.Access-Control-Allow-Origin': "'*'",
                            'method.response.header.Access-Control-Allow-Methods': "'GET,POST,PUT,OPTIONS'"
                        }
                    }],
                    passthrough_behavior=apigw.PassthroughBehavior.NEVER,
                    request_templates={"application/json": '{"statusCode": 200}'}
                ),
    method_responses=[{
                'statusCode': '200',
                'responseParameters': {
                    'method.response.header.Access-Control-Allow-Headers': True,
                    'method.response.header.Access-Control-Allow-Origin': True,
                    'method.response.header.Access-Control-Allow-Methods': True
                }
            }]
        )

# Main methods with CORS headers in integration response
        integration = apigw.LambdaIntegration(
                task_function,
                integration_responses=[{
                    'statusCode': '200',
                    'responseParameters': {
                        'method.response.header.Access-Control-Allow-Origin': "'*'"
                    }
                }],
                passthrough_behavior=apigw.PassthroughBehavior.WHEN_NO_MATCH,
                content_handling=apigw.ContentHandling.CONVERT_TO_TEXT
            )

        tasks.add_method("GET", integration,
                 authorization_type=apigw.AuthorizationType.COGNITO,
                 authorizer=authorizer,
                 method_responses=[{
                     'statusCode': '200',
                     'responseParameters': {
                         'method.response.header.Access-Control-Allow-Origin': True
                     }
                 }]
)

        tasks.add_method("POST", integration,
                 authorization_type=apigw.AuthorizationType.COGNITO,
                 authorizer=authorizer,
                 method_responses=[{
                     'statusCode': '200',
                     'responseParameters': {
                         'method.response.header.Access-Control-Allow-Origin': True
                     }
                 }]
)

        tasks.add_method("PUT", integration,
                 authorization_type=apigw.AuthorizationType.COGNITO,
                 authorizer=authorizer,
                 method_responses=[{
                     'statusCode': '200',
                     'responseParameters': {
                         'method.response.header.Access-Control-Allow-Origin': True
                     }
                 }]
)

        # Lambda for User Listing
        list_users_function = _lambda.Function(self, "ListUsersHandler",
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="handler.handler", 
            code=_lambda.Code.from_asset("lambda/user"),
            environment={
                "USER_POOL_ID": user_pool.user_pool_id
            }
        )

        # Grant Cognito ListUsers permission to the Lambda
        list_users_function.add_to_role_policy(iam.PolicyStatement(
            actions=["cognito-idp:ListUsers", "cognito-idp:AdminListGroupsForUser", "cognito-idp:AdminCreateUser", "cognito-idp:AdminAddUserToGroup"],
            resources=[user_pool.user_pool_arn]
        ))

        users_resource = api.root.add_resource("users")

        users_resource.add_method("OPTIONS", apigw.MockIntegration(
            integration_responses=[{
                'statusCode': '200',
                'responseParameters': {
                    'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
                    'method.response.header.Access-Control-Allow-Origin': "'*'",
                    'method.response.header.Access-Control-Allow-Methods': "'GET,OPTIONS'"
                }
            }],
            passthrough_behavior=apigw.PassthroughBehavior.NEVER,
            request_templates={"application/json": '{"statusCode": 200}'}
        ), method_responses=[{
            'statusCode': '200',
            'responseParameters': {
                'method.response.header.Access-Control-Allow-Headers': True,
                'method.response.header.Access-Control-Allow-Origin': True,
                'method.response.header.Access-Control-Allow-Methods': True
            }
        }])

        list_users_integration = apigw.LambdaIntegration(
            list_users_function,
            integration_responses=[{
                'statusCode': '200',
                'responseParameters': {
                    'method.response.header.Access-Control-Allow-Origin': "'*'"
                }
            }],
            passthrough_behavior=apigw.PassthroughBehavior.WHEN_NO_MATCH,
            content_handling=apigw.ContentHandling.CONVERT_TO_TEXT
        )

        users_resource.add_method("GET", list_users_integration,
            authorization_type=apigw.AuthorizationType.COGNITO,
            authorizer=authorizer,
            method_responses=[{
                'statusCode': '200',
                'responseParameters': {
                    'method.response.header.Access-Control-Allow-Origin': True
                }
            }]
        )

        users_resource.add_method("POST", list_users_integration,
            authorization_type=apigw.AuthorizationType.COGNITO,
            authorizer=authorizer,
            method_responses=[{
                'statusCode': '200',
                'responseParameters': {
                    'method.response.header.Access-Control-Allow-Origin': True
                }
            }]
        )

        # Output the API endpoint
        CfnOutput(self, "TaskApiEndpoint", value=api.url)

        # Deadline Checker Lambda
        deadline_lambda = _lambda.Function(self, "DeadlineChecker",
            runtime=_lambda.Runtime.PYTHON_3_12,
            handler="handler.handler",
            code=_lambda.Code.from_asset("lambda/deadline"),
            environment={
                "TASK_TABLE": task_table.table_name,
                "NOTIFICATION_TOPIC_ARN": topic.topic_arn
            }
        )

        task_table.grant_read_data(deadline_lambda)
        topic.grant_publish(deadline_lambda)

        # Scheduled EventBridge Rule
        rule = events.Rule(self, "HourlyCheck",
            schedule=events.Schedule.rate(Duration.hours(1))
        )
        rule.add_target(targets.LambdaFunction(deadline_lambda))

