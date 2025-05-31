import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { ValidRoutes } from "./shared/ValidRoutes";

dotenv.config(); // Read the .env file in the current working directory, and load values into process.env.
const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";
const INDEX_HTML = path.join(STATIC_DIR, "index.html");

const app = express();
app.use(express.static(STATIC_DIR));

app.get("/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
});

// Serve index.html for /login
app.get("/login", (req, res) => {
    res.sendFile(INDEX_HTML, { root: process.cwd() });
});

Object.values(ValidRoutes).forEach((route) => {
    // Skip parameterized routes like "/images/:id"
    if (route.includes(":")) return;

    app.get(route, (req, res) => {
        res.sendFile(INDEX_HTML, { root: process.cwd() });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
