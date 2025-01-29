const express = require("express");
const cors = require("cors");
const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

// SSE (Server-Sent Events) setup
let clients = [];

app.get("/notifications", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders();

    clients.push(res);

    req.on("close", () => {
        clients = clients.filter(client => client !== res);
    });
});

// Send interactive notification (Accept/Decline)
app.post("/send-notification", (req, res) => {
    const { message, username, profileImage, source, notificationType } = req.body;

    const notification = {
        message,
        username,
        profileImage,
        source,
        timestamp: new Date(),
        notificationType,  //  field to identify the type of notification
    };

    // Broadcasting notification to all clients
    clients.forEach(client => {
        client.write(`data: ${JSON.stringify(notification)}\n\n`);
    });

    res.status(200).send("Notification sent");
});

app.post("/notification-response", (req, res) => {
    const { notificationId, action } = req.body;

    // Store the response in the database (or process it accordingly)
    console.log(`Notification ID: ${notificationId} - Action: ${action}`);

    // For now, just send a response back
    res.json({ success: true, message: `Action '${action}' recorded for notification ${notificationId}` });
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
