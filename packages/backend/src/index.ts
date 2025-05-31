// src/index.ts

import express, { Request, Response } from "express";   // default & named imports
import * as dotenv from "dotenv";
import path from "path";
import { MongoClient } from "mongodb";
import { ImageProvider } from "./ImageProvider";
import { createImageRouter } from "./routes/imageRoutes";

dotenv.config();

// Validate required environment variables
if (!process.env.MONGO_URL) {
    console.error("Error: MONGO_URL environment variable is not set");
    process.exit(1);
}
if (!process.env.STATIC_DIR) {
    console.error("Error: STATIC_DIR environment variable is not set");
    process.exit(1);
}

const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR;          // e.g. "../frontend/dist"
const INDEX_HTML = path.join(STATIC_DIR, "index.html");

const app = express();

// 1) Parse JSON bodies for PATCH requests
app.use(express.json());

async function startServer() {
    // 2) Connect to MongoDB
    const mongoClient = new MongoClient(process.env.MONGO_URL!);
    await mongoClient.connect();
    const imageProvider = new ImageProvider(mongoClient);

    // 3) Mount API routes under /api/images
    app.use("/api/images", createImageRouter(imageProvider));

    // 4) Serve static files from STATIC_DIR
    app.use(express.static(STATIC_DIR));

    // 5) SPA fallback: anything not starting with /api goes to index.html
    app.get("*", (req: Request, res: Response) => {
        if (req.path.startsWith("/api/")) {
            // If it's an undefined API path, return 404
            return res.status(404).json({ error: "API route not found" });
        }
        // Otherwise, send index.html (for React Router)
        return res.sendFile(INDEX_HTML, { root: process.cwd() });
    });

    // 6) Start listening
    app.listen(PORT, () => {
        console.log(`Server listening at http://localhost:${PORT}`);
    });
}

startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
});
