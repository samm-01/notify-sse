# Notification System with SSE

This project implements a Notification System that uses Server-Sent Events (SSE) to send real-time notifications to the frontend. The backend is built with Node.js and Express, and the frontend is built with React. The system allows the user to send notifications from the backend, which are displayed on the frontend.

## Testing the Notification System

### Headers:

- Key: Content-Type
- Value: application/json

## Post req to broadcast notification to all users `http://localhost:5050/send-notification`

### Body (raw JSON):

```
{
  "message": "This is a broadcast notification",
  "username": "Admin",
  "profileImage": "https://via.placeholder.com/50",
  "source": "System",
  "notificationType": "general"
}

```

## To mark the notification as read `http://localhost:5050/notification-response`

### Body (raw JSON):

```
{
  "userId": 123,
  "notificationId": 1,
  "action": "acknowledge"
}
```

## To join the group `http://localhost:5050/join-group/321/987`

## To send the group notification `http://localhost:5050/send-group-notification/321`

### Body (raw JSON):

```
{
  "message": "Group announcement from 321 for all members!",
  "username": "Team Lead",
  "profileImage": "https://via.placeholder.com/50",
  "source": "Team Chat",
  "notificationType": "group"
}

```
