# API Documentation

Complete API reference for the Onboarding Alchemy Platform.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://api.yourdomain.com/api`

## Authentication

Most endpoints require authentication using JWT tokens.

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Endpoints

### Authentication

#### Register

Create a new HR user account.

```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "hr@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "company": "Acme Corp",
  "role": "HR"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "hr@example.com",
    "name": "John Doe",
    "role": "HR"
  }
}
```

#### Login

Authenticate and receive a JWT token.

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "hr@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "hr@example.com",
    "name": "John Doe",
    "role": "HR"
  }
}
```

#### Forgot Password

Request a password reset email.

```http
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "hr@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "If the email exists, a reset link has been sent"
}
```

#### Reset Password

Reset password using the token from email.

```http
POST /auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "newSecurePassword123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset successful"
}
```

### Employees

#### List Employees

Get all employees managed by the authenticated HR user.

```http
GET /employees
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "employeeId": "EMP-001",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "role": "Software Engineer",
    "status": "active",
    "startDate": "2024-01-15T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Get Employee

Get a specific employee by ID.

```http
GET /employees/:id
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "employeeId": "EMP-001",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "role": "Software Engineer",
  "status": "active",
  "startDate": "2024-01-15T00:00:00.000Z",
  "user": {
    "id": "user_uuid",
    "email": "jane@example.com",
    "name": "Jane Smith"
  }
}
```

#### Create Employee

Create a new employee and automatically send welcome/credentials emails.

```http
POST /employees
```

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "role": "Software Engineer",
  "employee_id": "EMP-001",
  "start_date": "2024-01-15"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "employeeId": "EMP-001",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "userId": "user_uuid",
  "...": "..."
}
```

#### Update Employee

Update employee information.

```http
PATCH /employees/:id
```

**Request Body:**
```json
{
  "status": "active",
  "phone": "+0987654321"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "...": "updated_data"
}
```

#### Get My Profile (Employee)

Get the profile of the authenticated employee.

```http
GET /employees/me
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "...": "..."
}
```

### Documents

#### Upload Document

Upload a document for an employee.

```http
POST /documents/upload
```

**Headers:**
```
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: The file to upload
- `employeeId`: UUID of the employee
- `type`: Document type (`job_description`, `contract`, `resume`, `other`)

**Response:** `200 OK`
```json
{
  "id": 1,
  "type": "contract",
  "filename": "contract.pdf",
  "path": "uploads/abc123.pdf",
  "employeeId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Get Documents

Get all documents for an employee.

```http
GET /documents?employeeId=<uuid>
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "type": "contract",
    "filename": "contract.pdf",
    "path": "uploads/abc123.pdf",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Download Document

Download a specific document.

```http
GET /documents/:id/download
```

**Response:** File download

### HR Tasks

#### List Tasks

Get all HR tasks for employees.

```http
GET /hr_tasks?employeeId=<uuid>
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "Prepare Offer Letter",
    "category": "HR",
    "status": "pending",
    "priority": "high",
    "dueDate": "2024-01-10T00:00:00.000Z",
    "employeeId": "uuid"
  }
]
```

#### Create Task

Create a new HR task.

```http
POST /hr_tasks
```

**Request Body:**
```json
{
  "title": "Setup laptop",
  "category": "IT",
  "priority": "high",
  "dueDate": "2024-01-15",
  "employeeId": "uuid"
}
```

**Response:** `200 OK`

#### Update Task

Update a task's status or details.

```http
PATCH /hr_tasks/:id
```

**Request Body:**
```json
{
  "status": "completed"
}
```

**Response:** `200 OK`

#### Delete Task

Delete a task.

```http
DELETE /hr_tasks/:id
```

**Response:** `200 OK`

### Milestones (30-60-90 Plans)

#### Get Milestones

Get onboarding milestones for an employee.

```http
GET /milestones?employeeId=<uuid>
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "Complete orientation",
    "category": "First 30 Days",
    "completed": false,
    "notes": null,
    "employeeId": "uuid"
  }
]
```

#### Assign Plan

Assign a 30-60-90 day plan to an employee.

```http
POST /milestones
```

**Request Body:**
```json
{
  "employeeId": "uuid",
  "tasks": [
    {
      "title": "Complete orientation",
      "category": "First 30 Days"
    },
    {
      "title": "First project",
      "category": "60 Days"
    }
  ]
}
```

**Response:** `200 OK`

#### Update Milestone

Update milestone completion status.

```http
PATCH /milestones/:id
```

**Request Body:**
```json
{
  "completed": true,
  "notes": "Completed successfully"
}
```

**Response:** `200 OK`

### Meetings

#### Create Meeting

Schedule a meeting.

```http
POST /meetings
```

**Request Body:**
```json
{
  "employeeId": "uuid",
  "purpose": "First day orientation",
  "date": "2024-01-15T10:00:00.000Z"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "purpose": "First day orientation",
  "date": "2024-01-15T10:00:00.000Z",
  "status": "scheduled",
  "employeeId": "uuid",
  "hrId": "uuid"
}
```

#### Get Upcoming Meetings

Get all upcoming meetings.

```http
GET /meetings
```

**Query Parameters:**
- `employeeId` (optional): Filter by employee

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "purpose": "First day orientation",
    "date": "2024-01-15T10:00:00.000Z",
    "status": "scheduled",
    "employee": {
      "name": "Jane Smith"
    }
  }
]
```

### Messages

#### Get Messages

Get messages between HR and employee.

```http
GET /messages
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "content": "Welcome to the team!",
    "read": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "sender": {
      "name": "HR Manager"
    },
    "receiver": {
      "name": "Jane Smith"
    }
  }
]
```

#### Send Message

Send a message.

```http
POST /messages
```

**Request Body:**
```json
{
  "receiverId": "uuid",
  "content": "Welcome to the team!"
}
```

**Response:** `200 OK`

### Settings & Profile

#### Get HR Profile

Get the authenticated HR user's profile.

```http
GET /hr_profiles
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "hr@example.com",
  "name": "HR Manager",
  "company": "Acme Corp",
  "settings": {
    "notifications": {
      "email": true
    },
    "system": {
      "language": "en",
      "dateFormat": "mdy"
    }
  }
}
```

#### Update Settings

Update HR user settings.

```http
PATCH /hr_profiles
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "settings": {
    "notifications": {
      "email": false
    }
  }
}
```

**Response:** `200 OK`

### AI Copilot Features

#### Generate Job Description

Generate a job description using AI.

```http
POST /ai/generate-jd
```

**Request Body:**
```json
{
  "role": "Software Engineer"
}
```

**Response:** `200 OK`
```json
{
  "description": "We are looking for a Software Engineer..."
}
```

#### Generate Onboarding Plan

Generate a 30-60-90 day plan.

```http
POST /ai/generate-plan
```

**Request Body:**
```json
{
  "role": "Product Manager"
}
```

**Response:** `200 OK`
```json
{
  "plan": [
    {
      "title": "Company Orientation",
      "category": "First 30 Days"
    }
  ]
}
```

#### Draft Email

Draft an email using AI.

```http
POST /ai/draft-email
```

**Request Body:**
```json
{
  "type": "welcome",
  "recipientName": "Jane",
  "role": "Engineer",
  "startDate": "next Monday"
}
```

**Response:** `200 OK`
```json
{
  "subject": "Welcome to the team, Jane!",
  "body": "Hi Jane,\n\nWe are thrilled..."
}
```

#### Detect Risks

Detect onboarding risks.

```http
GET /ai/risks
```

**Response:** `200 OK`
```json
[
  {
    "employeeName": "Jane Smith",
    "reason": "Overdue Tasks",
    "count": 2,
    "details": ["Order laptop", "Setup email"]
  }
]
```

#### Check Compliance

Check document compliance.

```http
GET /ai/compliance
```

**Response:** `200 OK`
```json
[
  {
    "employeeName": "Jane Smith",
    "missingDocs": ["Contract"],
    "severity": "High"
  }
]
```

#### Suggest Meeting Time

Suggest optimal meeting times.

```http
GET /ai/suggest-meeting
```

**Response:** `200 OK`
```json
{
  "suggestions": [
    "Tomorrow at 10:00 AM",
    "Next Tuesday at 2:00 PM"
  ]
}
```

#### Chat with HR Bot

Ask questions to the HR assistant.

```http
POST /ai/chat
```

**Request Body:**
```json
{
  "question": "What are the steps for onboarding?"
}
```

**Response:** `200 OK`
```json
{
  "answer": "The onboarding process typically includes..."
}
```

#### Analyze Sentiment

Analyze sentiment of feedback.

```http
POST /ai/sentiment
```

**Request Body:**
```json
{
  "text": "I really love the onboarding process!"
}
```

**Response:** `200 OK`
```json
{
  "sentiment": "positive",
  "score": 0.95
}
```

#### Recommend Resources

Get recommended resources for an employee.

```http
GET /ai/resources
```

**Response:** `200 OK`
```json
{
  "resources": [
    {
      "title": "Company Handbook",
      "url": "https://..."
    }
  ]
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "error": "Invalid input data"
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized - Invalid or missing token"
}
```

### 403 Forbidden

```json
{
  "error": "Forbidden - Insufficient permissions"
}
```

### 404 Not Found

```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error",
  "message": "Error details..."
}
```

## Rate Limiting

API requests are limited to:
- **100 requests per 15 minutes** per IP address
- **1000 requests per hour** per authenticated user

When rate limit is exceeded:

```json
{
  "error": "Too many requests",
  "retryAfter": 900
}
```

## Webhooks

*(Coming soon)*

## SDKs

*(Coming soon)*

## Support

For API support, please open an issue in the GitHub repository or contact support@yourdomain.com.

---

**Last Updated**: November 2024
**Version**: 1.0.0
