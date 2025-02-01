const express = require("express");
const cors = require("cors");
const app = express();
const port = 5050;
const mysql = require('mysql2')
require("dotenv").config();  // Load environment variables from .env file


app.use(cors());
app.use(express.json());

// MySQL database connection using environment variables
const db = mysql.createConnection({
    host: process.env.DB_HOST,        // Database host
    user: process.env.DB_USER,        // Database user
    password: process.env.DB_PASSWORD, // Database password
    database: process.env.DB_NAME     // Database name
});

db.connect(err => {
    if (err) {
        console.error("Error connecting to the database:", err);
    } else {
        console.log("Connected to the database");
    }
});

// Store all connected clients
let clients = [];
// Map users to their SSE connections
let clientMap = new Map();
// Store groups and their associated users
let groups = new Map();

/**
 * SSE Endpoint to Subscribe for Notifications
 * Each user connects with their userId to receive notifications.
 */
app.get("/notifications/:userId", (req, res) => {
    const userId = req.params.userId;

    // Set necessary SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // Store client connection
    clients.push(res);
    clientMap.set(userId, res);

    // Cleanup on disconnect
    req.on("close", () => {
        clients = clients.filter(client => client !== res);
        clientMap.delete(userId);
        groups.forEach((members, groupId) => {
            members.delete(userId);
            if (members.size === 0) groups.delete(groupId);
        });
    });
});

/**
 * Broadcast Notification to All Connected Clients
 */
app.post("/send-notification", (req, res) => {
    const { message, username, profileImage, source, notificationType } = req.body;

    const notification = {
        message,
        username,
        profileImage,
        source,
        timestamp: new Date(),
        notificationType,
    };

    // Send notification to all connected clients
    clients.forEach(client => {
        client.write(`data: ${JSON.stringify(notification)}\n\n`);
    });

    res.status(200).send("Broadcast notification sent");
});

/**
 * Emit Notification to a Specific User
 */
app.post("/send-notification/:userId", (req, res) => {
    const { userId } = req.params;
    const { message, username, profileImage, source, notificationType } = req.body;

    const notification = {
        message,
        username,
        profileImage,
        source,
        timestamp: new Date(),
        notificationType,
    };

    // Check if the user is connected before sending notification
    if (clientMap.has(userId)) {
        clientMap.get(userId).write(`data: ${JSON.stringify(notification)}\n\n`);
        res.status(200).send(`Notification sent to user ${userId}`);
    } else {
        res.status(404).send("User not connected");
    }
});

/**
 * Add a User to a Group
 */
app.post("/join-group/:groupId/:userId", (req, res) => {
    const { groupId, userId } = req.params;

    // Initialize group if it doesn't exist
    if (!groups.has(groupId)) {
        groups.set(groupId, new Set());
    }
    groups.get(groupId).add(userId);

    res.status(200).send(`User ${userId} added to group ${groupId}`);
});

/**
 * Send Notification to a Specific Group
 */
app.post("/send-group-notification/:groupId", (req, res) => {
    const { groupId } = req.params;
    const { message, username, profileImage, source, notificationType } = req.body;

    const notification = {
        message,
        username,
        profileImage,
        source,
        timestamp: new Date(),
        notificationType,
    };

    // Check if the group exists before sending notification
    if (groups.has(groupId)) {
        groups.get(groupId).forEach(userId => {
            if (clientMap.has(userId)) {
                clientMap.get(userId).write(`data: ${JSON.stringify(notification)}\n\n`);
            }
        });
        res.status(200).send(`Notification sent to group ${groupId}`);
    } else {
        res.status(404).send("Group not found or empty");
    }
});

/**
 * Handle User Response to a Notification
 */
app.post("/notification-response", (req, res) => {
    const { notificationId, action } = req.body;

    console.log(`Notification ID: ${notificationId} - Action: ${action}`);

    res.json({ success: true, message: `Action '${action}' recorded for notification ${notificationId}` });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
