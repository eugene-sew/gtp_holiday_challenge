# Field Team Task Management System Lab

This repository contains my solution to a lab assignment for designing and implementing a Task Management System for a field team using AWS serverless services, built with the AWS Cloud Development Kit (CDK) in Python.

## Project Overview

The goal of this project is to create a secure, event-driven task management system that enables an admin to create and assign tasks to field team members. Team members log in to view and update their assigned tasks, while the admin can oversee all tasks, assignments, and deadlines. The system efficiently handles task notifications, status updates, and deadline tracking to ensure a seamless workflow for the field team.

## Main Features

- **User Authentication & Authorization:**
  - AWS Cognito User Pools for user management (admin/member roles)
  - Secure API access with Cognito authorizer
- **Task Management API:**
  - Admin can create and assign tasks to team members
  - Team members can view and update their assigned tasks
  - Admin can oversee all tasks, assignments, and deadlines
- **Serverless Compute:**
  - AWS Lambda functions for all backend logic (task CRUD, user listing, deadline checks)
- **Persistent Storage:**
  - DynamoDB table for storing tasks
- **Notifications:**
  - Email notifications via Amazon SES when tasks are assigned
  - Push notifications via Amazon SNS for status updates and deadline alerts
- **Deadline Tracking:**
  - Lambda function triggered by EventBridge to check for upcoming deadlines and notify relevant users
- **Infrastructure as Code:**
  - Entire stack defined and deployed using AWS CDK (Python)

## Architecture Diagram

Below is the architecture diagram of the solution:

![Field Team Task Management System Architecture](image/structure.png)

## Technology Stack

- **AWS CDK (Python):** Infrastructure as code
- **AWS Lambda:** Serverless compute
- **Amazon API Gateway:** REST API endpoints
- **Amazon Cognito:** Authentication and user management
- **Amazon DynamoDB:** NoSQL database for tasks
- **Amazon SNS & SES:** Notifications (push and email)
- **Amazon EventBridge:** Scheduled events for deadline checks

## Getting Started

1. **Clone the repository and set up your Python virtual environment:**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
2. **Deploy the stack:**
   ```bash
   cdk deploy
   ```
3. **Explore the API:**
   - Use the output API endpoint to interact with the system (see CloudFormation outputs after deploy)
   - Authenticate using Cognito (admin/member roles)

## Project Learning Objectives

- Build a secure, serverless API on AWS
- Use AWS CDK for infrastructure automation
- Integrate Lambda, API Gateway, Cognito, DynamoDB, SNS, and SES
- Gain experience with event-driven architectures and scheduled tasks
- Design a workflow for efficient field team task management

## Useful Commands

- `cdk synth` – Synthesize the CloudFormation template
- `cdk deploy` – Deploy the stack to AWS
- `cdk diff` – Compare deployed stack with local changes
- `cdk destroy` – Remove the stack from your AWS account

---

Enjoy exploring my solution to the Field Team Task Management System Lab!
