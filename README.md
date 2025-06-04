# FieldTask - Task Management System

This monorepository presents **my solution to the holiday challenge** for designing and implementing a robust Task Management System for a field team. Built with AWS serverless services and the AWS Cloud Development Kit (CDK) in Python, it provides comprehensive features for task creation, assignment, status tracking, and team overview, fulfilling the requirements of the Holiday Task lab.

## Project Overview

My primary objective for this project was to create a secure, event-driven task management system that enables an admin to create and assign tasks to field team members. Team members can securely log in to view and update their assigned tasks, while the admin retains full oversight of all tasks, assignments, and deadlines. The system was designed to efficiently handle task notifications, status updates, and deadline tracking, ensuring a seamless workflow for the field team.

## Features

### Frontend Features:

- **User Authentication**: Secure login for users (admins and members) using AWS Cognito.
- **Role-Based Access Control**:
  - Admins: Can create, assign, view, and delete tasks; manage team members; and view overall dashboard statistics.
  - Members: Can view and update their assigned tasks and view their personalized dashboard.
- **Task Management**:
  - Create, view, update (status), and delete (admin-only) tasks.
  - Assign tasks to team members.
  - Set deadlines for tasks.
  - Track task status: New, In Progress, Completed.
- **Dashboard**: Overview of task statistics, pie chart visualization of task status, recent activity feed, and a list of upcoming tasks.
- **Team Overview (Admin-only)**: View team members and their task statistics.
- **Notifications**: In-app notifications for task assignments or status updates.
- **Responsive UI**: Designed to work across various screen sizes.

### Backend Features:

- **User Authentication & Authorization**: AWS Cognito User Pools for user management (admin/member roles) and secure API access with Cognito authorizer.
- **Task Management API**: REST API endpoints for task CRUD operations and user listing.
- **Notifications**: Email notifications via Amazon SES when tasks are assigned, and push notifications via Amazon SNS for status updates and deadline alerts.
- **Deadline Tracking**: Lambda function triggered by EventBridge to check for upcoming deadlines and notify relevant users.

## Architecture Diagram

![Field Team Task Management System Architecture](/serverless/image/stucture.png)

## Technology Stack

### Frontend:

- **React**: JavaScript library for building user interfaces.
- **Vite**: Fast frontend build tool.
- **TypeScript**: Superset of JavaScript that adds static typing.
- **Zustand**: State-management solution.
- **React Router DOM**: For client-side routing.
- **Tailwind CSS**: Utility-first CSS framework.
- **Recharts**: Composable charting library for data visualization.
- **Lucide React**: Open-source icons.
- **AWS Cognito**: For user authentication (via `amazon-cognito-identity-js`).

### Backend (AWS Serverless):

- **AWS CDK (Python)**: Infrastructure as Code.
- **AWS Lambda**: Serverless compute for backend logic.
- **Amazon API Gateway**: REST API endpoints.
- **Amazon Cognito**: Authentication and user management.
- **Amazon DynamoDB**: NoSQL database for tasks.
- **Amazon SNS & SES**: Notifications (push and email).
- **Amazon EventBridge**: Scheduled events for deadline checks.

## Getting Started

### Prerequisites

- Node.js (v18.x or later recommended) and npm (for frontend).
- Python 3 and pip (for backend).
- AWS CLI configured with appropriate credentials.

### Frontend Setup and Installation

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `frontend` directory based on `.env.example` and fill in the necessary AWS Cognito and API Gateway values:
    ```env
    VITE_APP_AUTH_USER_POOL_ID=<Your_Cognito_User_Pool_ID>
    VITE_APP_AUTH_USER_POOL_WEB_CLIENT_ID=<Your_Cognito_User_Pool_Web_Client_ID>
    VITE_APP_API_BASE_URL=<Your_Task_API_Base_URL>
    ```
4.  Run the application:
    ```bash
    npm run dev
    ```
    The application will typically start on `http://localhost:5173`.

### Backend Setup and Deployment

1.  Navigate to the `serverless` directory:
    ```bash
    cd serverless
    ```
2.  Set up your Python virtual environment and install dependencies:
    ```bash
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    ```
3.  Deploy the stack to AWS using CDK:
    ```bash
    cdk deploy
    ```
    (Note: Ensure you have bootstrapped CDK in your AWS account if this is your first deployment: `cdk bootstrap aws://YOUR-ACCOUNT-ID/YOUR-REGION`)

## Testing the Live Application
You can test the live application at the URL provided by AWS Amplify Hosting: 
- `https://main.d1wbbnjgdrig4e.amplifyapp.com/`

Use the default admin credentials:

- **Username:** `sandb-admin`
- **Password:** `@y3h2CuonH`

As an admin, you can navigate to the Team Management section to add new team members and test member-specific functionalities.

## Useful Commands

### Frontend:

- `npm run build` – Create a production build.
- `npm run lint` – Lint the codebase using ESLint.

### Backend (CDK):

- `cdk synth` – Synthesize the CloudFormation template.
- `cdk diff` – Compare deployed stack with local changes.
- `cdk destroy` – Remove the stack from your AWS account.

## Project Learning Objectives

Through the development of this solution, I aimed to:

- Build a secure, serverless API on AWS.
- Utilize AWS CDK for infrastructure automation.
- Integrate various AWS services, including Lambda, API Gateway, Cognito, DynamoDB, SNS, and SES.
- Gain practical experience with event-driven architectures and scheduled tasks.
- Design a workflow for efficient field team task management.
