# Backend API Integration Guide

## Overview
This document provides frontend integration details for the Good Heart Charity Platform API.

---

## 1. Donor Endpoints

### Donor Signup
**Endpoint:** `POST /donor/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Signup successful! Welcome email sent.",
  "user": {
    "id": "63abc123def456",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- 400: `{ "success": false, "message": "All fields are required" }`
- 400: `{ "success": false, "message": "Email already exists" }`
- 500: `{ "success": false, "message": "Server Error" }`

**Automatic Actions:**
- Welcome email sent to donor's email address
- Email includes: Welcome message, platform introduction, call to action

---

### Donor Login
**Endpoint:** `POST /donor/signin`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful!",
  "token": "jwt_token_here",
  "user": {
    "id": "63abc123def456",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "donor"
  }
}
```

**Error Responses:**
- 400: `{ "success": false, "message": "Email and password are required!" }`
- 401: `{ "success": false, "message": "Donor not found" }`
- 401: `{ "success": false, "message": "Invalid credentials entry" }`
- 500: `{ "success": false, "message": "Server Error" }`

---

### Get All Donors
**Endpoint:** `GET /donor/all`

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "63abc123def456",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## 2. NGO Endpoints

### NGO Signup
**Endpoint:** `POST /ngo/signup`

**Request Body:**
```json
{
  "name": "Contact Person Name",
  "email": "ngo@example.com",
  "password": "SecurePass123!",
  "ngoName": "NGO Organization Name",
  "description": "NGO description and mission"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "NGO signup successful! Pending verification. Welcome email sent.",
  "user": {
    "id": "63abc456def789",
    "name": "Contact Person Name",
    "email": "ngo@example.com"
  }
}
```

**Error Responses:**
- 400: `{ "success": false, "message": "Contact person name, email, password, organization name, and description are required" }`
- 400: `{ "success": false, "message": "Email already exists" }`
- 500: `{ "success": false, "message": "Server Error" }`

**Automatic Actions:**
- Welcome email sent to NGO contact's email
- Email includes: Organization name, verification status, team introduction
- NGO status set to "pending_verification"

---

### NGO Login
**Endpoint:** `POST /ngo/signin`

**Request Body:**
```json
{
  "email": "ngo@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful!",
  "token": "jwt_token_here",
  "user": {
    "id": "63abc456def789",
    "name": "Contact Person Name",
    "email": "ngo@example.com",
    "role": "ngo",
    "registrationStatus": "pending_verification"
  }
}
```

**Error Responses:**
- 400: `{ "success": false, "message": "Email and password are required!" }`
- 401: `{ "success": false, "message": "NGO not found" }`
- 401: `{ "success": false, "message": "Invalid credentials entry" }`
- 403: `{ "success": false, "message": "Your registration has been rejected" }`
- 500: `{ "success": false, "message": "Server Error" }`

---

### Get All NGOs
**Endpoint:** `GET /ngo/all`

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "63abc456def789",
      "name": "Contact Person",
      "email": "ngo@example.com",
      "description": "NGO description",
      "registrationStatus": "pending_verification"
    }
  ]
}
```

---

## 3. Contact Form Endpoints

### Submit Contact Message
**Endpoint:** `POST /contact/submit`

**Request Body:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "subject": "Contact Subject",
  "message": "Detailed message from user (minimum 10 characters)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Message sent successfully! We'll get back to you soon.",
  "data": {
    "_id": "63abc789def012",
    "name": "User Name",
    "email": "user@example.com",
    "subject": "Contact Subject",
    "message": "Detailed message from user",
    "attended": false,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- 400: `{ "success": false, "message": "All fields are required" }`
- 500: `{ "success": false, "message": "Server Error" }`

**Automatic Actions:**
- ✅ Email sent to admin with user's message details
- ✅ Confirmation email sent to user's email address
- ✅ Success message displayed to user (top of page)
- Message stored in database for admin review

---

### Get All Messages (Admin)
**Endpoint:** `GET /contact/all`

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "63abc789def012",
      "name": "User Name",
      "email": "user@example.com",
      "subject": "Contact Subject",
      "message": "Message content",
      "attended": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Get Message by ID
**Endpoint:** `GET /contact/:messageId`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "63abc789def012",
    "name": "User Name",
    "email": "user@example.com",
    "subject": "Contact Subject",
    "message": "Message content",
    "attended": false,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### Mark Message as Attended
**Endpoint:** `PATCH /contact/:messageId/mark-attended`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Message marked as attended",
  "data": {
    "_id": "63abc789def012",
    "attended": true,
    "attendedAt": "2024-01-15T11:00:00Z"
  }
}
```

---

### Delete Message
**Endpoint:** `DELETE /contact/:messageId`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

---

## Email Templates Overview

### Donor Welcome Email
- **Subject:** Welcome to Good Heart Charity Platform!
- **Includes:** Welcome greeting, success message, thank you message
- **Sent To:** Donor email address
- **Triggered:** On successful signup

### NGO Welcome Email
- **Subject:** Welcome to Good Heart Charity Platform!
- **Includes:** Organization name, verification status, team introduction
- **Sent To:** NGO contact person email
- **Triggered:** On successful signup

### Contact Confirmation Email
- **Subject:** We received your message
- **Includes:** Acknowledgment of message receipt, expected response timeline
- **Sent To:** User's email address
- **Triggered:** On message submission

### Admin Notification Email
- **Subject:** New Contact Message: [Subject]
- **Includes:** Sender details, message content, timestamp
- **Sent To:** Admin email (from .env)
- **Triggered:** On message submission

---

## Frontend Integration Example

### Contact Form Submission
```javascript
const handleContactSubmit = async (e) => {
  e.preventDefault();
  
  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    subject: document.getElementById('subject').value,
    message: document.getElementById('message').value
  };

  try {
    const response = await fetch('http://localhost:4500/contact/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    
    if (data.success) {
      // Show success message at top
      showSuccessAlert(data.message);
      // Reset form
      e.target.reset();
    } else {
      showErrorAlert(data.message);
    }
  } catch (error) {
    showErrorAlert('Error submitting message');
  }
};
```

---

## Environment Variables Required

```
PORT=4500
MONGO_URI="your_mongo_connection_string"
JWT_SECRET="your_jwt_secret"
EMAIL_USER="your_gmail_email"
EMAIL_PASS="your_gmail_app_password"
ADMIN_EMAIL="admin_email_to_receive_messages"
```

---

## CORS Configuration

Frontend URL configured: `https://front-project-phi.vercel.app`
Methods allowed: GET, POST, PUT, DELETE, PATCH
Credentials: Enabled

To add more frontend URLs, update index.js CORS origin array.

---

## Notes

- All timestamps are in UTC
- Passwords must meet security requirements (8+ chars, uppercase, lowercase, number, special char)
- JWT tokens expire in 1 day
- Contact messages have minimum 10 character message length
- Email service uses Gmail SMTP with app-specific passwords
