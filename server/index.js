const express = require("express");
const cors = require("cors");

const app = express();

// ✅ Enable CORS to allow frontend access
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

let clients = [];

// ✅ SSE Notifications Endpoint
app.get("/notifications", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.write(`: Connection established\n\n`);
    clients.push(res);

    req.on("close", () => {
        clients = clients.filter(client => client !== res);
    });
});

// ✅ Function to Send Notifications
const sendNotification = (notification) => {
    const message = `data: ${JSON.stringify(notification)}\n\n`;
    clients.forEach(client => client.write(message));
};

// ✅ API to Send Notifications from Postman
app.post("/send-notification", (req, res) => {
    const { message, username, profileImage, source } = req.body;

    if (!message || !username || !profileImage || !source) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const notification = {
        message,
        username,
        profileImage,
        source,
        timestamp: new Date(),
    };

    sendNotification(notification);
    res.json({ success: true, notification });
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
