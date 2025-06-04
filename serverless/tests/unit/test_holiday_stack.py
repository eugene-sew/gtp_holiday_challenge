import aws_cdk as core
import aws_cdk.assertions as assertions

from holiday.holiday_stack import HolidayStack

# example tests. To run these tests, uncomment this file along with the example
# resource in holiday/holiday_stack.py
def test_sqs_queue_created():
    app = core.App()
    stack = HolidayStack(app, "holiday")
    template = assertions.Template.from_stack(stack)

#     template.has_resource_properties("AWS::SQS::Queue", {
#         "VisibilityTimeout": 300
#     })
