const express = require("express");
const cors = require("cors");
const mysql = require('mysql2');
require("dotenv").config();

const app = express();
const port = 5050;

app.use(cors());
app.use(express.json());

// MySQL database connection using environment variables
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
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
 * Store Notification in Database
 */
const storeNotification = (userId, message, username, profileImage, source, notificationType) => {
    const query = `
        INSERT INTO notifications (user_id, message, username, profile_image, source, notification_type)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.execute(query, [userId, message, username, profileImage, source, notificationType], (err, results) => {
        if (err) {
            console.error("Error saving notification:", err);
        } else {
            console.log(`Notification saved with ID: ${results.insertId}`);
        }
    });
};

/**
 * SSE Endpoint to Subscribe for Notifications
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

    // Save notification to the database for all users
    clients.forEach(client => {
        const userId = clientMap.get(client); // Assuming `clientMap` is storing userId as value
        storeNotification(userId, message, username, profileImage, source, notificationType);

        // Send notification to all connected clients
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

    // Save notification to the database for the specific user
    storeNotification(userId, message, username, profileImage, source, notificationType);

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

    // Save notification to the database for each user in the group
    if (groups.has(groupId)) {
        groups.get(groupId).forEach(userId => {
            storeNotification(userId, message, username, profileImage, source, notificationType);

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
    const { userId, notificationId, action } = req.body;

    // Check if notificationId and userId are provided and valid
    if (!notificationId || !userId) {
        return res.status(400).send('Notification ID and User ID are required');
    }

    // Update the notification status to 'read'
    const query = `UPDATE notifications SET status = 'read' WHERE id = ? AND user_id = ? AND status = 'unread'`;

    db.query(query, [notificationId, userId], (err, result) => {
        if (err) {
            console.error('Error updating notification:', err);
            return res.status(500).send(`Error updating notification: ${err.message}`);
        }

        // Check if any rows were affected
        if (result.affectedRows === 0) {
            return res.status(404).send('Notification not found or already marked as read');
        }

        console.log(`Notification ID: ${notificationId} - Action: ${action}`);
        res.json({ success: true, message: `Action '${action}' recorded for notification ${notificationId}` });
    });
});


// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
