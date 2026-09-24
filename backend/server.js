require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const profileRoutes = require("./routes/profileRoutes");
const friendRoutes = require("./routes/friendRoutes");

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
    process.env.CLIENT_URL || "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json());

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "PATCH"],
        credentials: true
    }
});

app.set("io", io);

io.on("connection", socket => {
    console.log("Socket connected:", socket.id);

    socket.on("register-user", profileId => {
        if (!profileId) return;

        socket.join(`user:${profileId}`);
        console.log(`User ${profileId} joined real-time room`);
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
    });
});

app.get("/", (req, res) => {
    res.json({
        name: "ReConnect API",
        status: "running",
        realtime: true
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        realtime: true,
        time: new Date().toISOString()
    });
});

app.use("/api/profile", profileRoutes);
app.use("/api/friends", friendRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`ReConnect backend running on http://localhost:${PORT}`);
    });
});
