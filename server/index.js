const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
require("dotenv").config(); // Load environment variables

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const app = express();
app.use(cors());
app.use(express.json());


db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL");
    }
});

// Sample Route
app.get("/api/data", (req, res) => {
    db.query("SELECT * FROM your_table", (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(result);
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
