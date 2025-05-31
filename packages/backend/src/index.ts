import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { ValidRoutes } from "./shared/ValidRoutes";
import { IMAGES, fetchCounter } from "./shared/ApiImageData";

dotenv.config();
const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";
const INDEX_HTML = path.join(STATIC_DIR, "index.html");

const app = express();

// ✅ Serve static files FIRST
app.use(express.static(STATIC_DIR));

// Hello test route
app.get("/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
});

// API route
app.get("/api/images", async (req, res) => {
    await waitDuration(1000);
    fetchCounter.count++;
    console.log("Fetching data x" + fetchCounter.count);
    res.json(IMAGES);
});

// SPA fallback for non-API frontend routes
Object.values(ValidRoutes).forEach((route) => {
    if (route.includes(":")) return;

    app.get(route, (req, res) => {
        res.sendFile(INDEX_HTML, { root: process.cwd() });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

function waitDuration(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
