#!/usr/bin/env python3
import os

import aws_cdk as cdk

from holiday.holiday_stack import HolidayStack


app = cdk.App()
HolidayStack(app, "HolidayStack",
             env=cdk.Environment(account=os.getenv('CDK_DEFAULT_ACCOUNT'), region=os.getenv('CDK_DEFAULT_REGION')),
             )

app.synth()
