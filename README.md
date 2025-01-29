# Notification System with SSE

This project implements a Notification System that uses Server-Sent Events (SSE) to send real-time notifications to the frontend. The backend is built with Node.js and Express, and the frontend is built with React. The system allows the user to send notifications from the backend, which are displayed on the frontend.

## Testing the Notification System

You can test the notification system using Postman by sending POST requests `http://localhost:5001/send-notification`

1. Headers:

- Key: Content-Type
- Value: application/json
- Body (raw JSON):

```
{
  "message": "You have a new notification!",
  "username": "Admin",
  "profileImage": "https://example.com/avatar.jpg",
  <!-- "source": "System", -->
  "notificationType": "interactive"

}
```
