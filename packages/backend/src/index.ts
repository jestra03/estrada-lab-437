// backend/src/index.ts

import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { ValidRoutes } from "./shared/ValidRoutes";
import { connectMongo } from "./connectMongo";
import { ImageProvider } from "./ImageProvider";

dotenv.config();

const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";
const INDEX_HTML = path.join(STATIC_DIR, "index.html");

const app = express();
app.use(express.static(STATIC_DIR));

app.get("/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
});

function waitDuration(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    const mongoClient = connectMongo();
    await mongoClient.connect();
    const dbName = process.env.DB_NAME!;
    const db = mongoClient.db(dbName);
    const collections = await db.listCollections().toArray();
    console.log("Mongo connected. Collections:", collections.map(c => c.name));

    const imageProvider = new ImageProvider(mongoClient);

    // API route using Mongo
    app.get("/api/images", async (req, res) => {
        await waitDuration(1000);
        try {
            const result = await imageProvider.getAllImagesDenormalized();
            res.json(result);
        } catch (err) {
            console.error("Failed to fetch images:", err);
            res.status(500).json({ error: "Failed to fetch images" });
        }
    });

    // SPA fallback
    Object.values(ValidRoutes).forEach((route) => {
        if (route.includes(":")) return;

        app.get(route, (req, res) => {
            res.sendFile(INDEX_HTML, { root: process.cwd() });
        });
    });

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
})();
