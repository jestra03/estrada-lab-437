// src/index.ts

import express from "express";
import * as dotenv from "dotenv";
import path from "path";
import { connectMongo } from "./connectMongo";
import { ImageProvider } from "./ImageProvider";
import { createImageRouter } from "./routes/imageRoutes";
import { ValidRoutes } from "./shared/ValidRoutes";

dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
    'MONGO_USER', 'MONGO_PWD', 'MONGO_CLUSTER', 'DB_NAME',
    'IMAGES_COLLECTION_NAME', 'USERS_COLLECTION_NAME', 'STATIC_DIR'
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Error: ${envVar} environment variable is not set`);
        process.exit(1);
    }
}

const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR!;
const INDEX_HTML = path.join(STATIC_DIR, "index.html");

const app = express();

// 1) Parse JSON bodies for PATCH requests
app.use(express.json());

async function startServer() {
    // 2) Connect to MongoDB using the connectMongo function
    const mongoClient = connectMongo();
    await mongoClient.connect();
    const imageProvider = new ImageProvider(mongoClient);

    // 3) Mount API routes under /api/images
    app.use("/api/images", createImageRouter(imageProvider));

    // 4) Serve static files from STATIC_DIR
    app.use(express.static(STATIC_DIR));

    // 5) SPA fallback: serve index.html for valid routes
    const validRoutePaths = Object.values(ValidRoutes);

    for (const routePath of validRoutePaths) {
        if (routePath !== "/") { // Home route is already handled by static files
            app.get(routePath, ((req, res) => {
                return res.sendFile(INDEX_HTML, { root: process.cwd() });
            }) as express.RequestHandler);
        }
    }

    // 6) Catch-all for any other routes (404 for API, index.html for others)
    app.get("*", ((req, res) => {
        if (req.path.startsWith("/api/")) {
            // If it's an undefined API path, return 404
            return res.status(404).json({ error: "API route not found" });
        }
        // For any other route not in ValidRoutes, you might want to return 404
        // But for SPA, usually we serve index.html and let client-side routing handle it
        return res.sendFile(INDEX_HTML, { root: process.cwd() });
    }) as express.RequestHandler);

    // 7) Start listening
    app.listen(PORT, () => {
        console.log(`Server listening at http://localhost:${PORT}`);
    });
}

startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
});