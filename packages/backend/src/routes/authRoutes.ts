// backend/src/routes/authRoutes.ts

import express from "express";
import jwt from "jsonwebtoken";
import { CredentialsProvider } from "../CredentialsProvider";

interface IAuthTokenPayload {
    username: string;
}

function generateAuthToken(username: string, jwtSecret: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const payload: IAuthTokenPayload = {
            username
        };
        jwt.sign(
            payload,
            jwtSecret,
            { expiresIn: "1d" },
            (error, token) => {
                if (error) reject(error);
                else resolve(token as string);
            }
        );
    });
}

export function createAuthRouter(credentialsProvider: CredentialsProvider) {
    const router = express.Router();

    // POST /auth/register
    router.post("/register", async (req: any, res: any) => {
        const { username, password } = req.body;

        // Validate request body
        if (!username || !password || typeof username !== "string" || typeof password !== "string") {
            return res.status(400).send({
                error: "Bad request",
                message: "Missing username or password"
            });
        }

        try {
            const success = await credentialsProvider.registerUser(username, password);

            if (!success) {
                return res.status(409).send({
                    error: "Conflict",
                    message: "Username already taken"
                });
            }

            // Generate token for immediate login after registration
            const jwtSecret = req.app.locals.JWT_SECRET;
            const token = await generateAuthToken(username, jwtSecret);

            return res.status(201).json({ token });
        } catch (err) {
            console.error("Registration failed:", err);
            return res.status(500).send({
                error: "Internal Server Error",
                message: "Registration failed"
            });
        }
    });

    // POST /auth/login
    router.post("/login", async (req: any, res: any) => {
        const { username, password } = req.body;

        // Validate request body
        if (!username || !password || typeof username !== "string" || typeof password !== "string") {
            return res.status(400).send({
                error: "Bad request",
                message: "Missing username or password"
            });
        }

        try {
            const isValid = await credentialsProvider.verifyPassword(username, password);

            if (!isValid) {
                return res.status(401).send({
                    error: "Unauthorized",
                    message: "Incorrect username or password"
                });
            }

            // Generate and return token
            const jwtSecret = req.app.locals.JWT_SECRET;
            const token = await generateAuthToken(username, jwtSecret);

            return res.json({ token });
        } catch (err) {
            console.error("Login failed:", err);
            return res.status(500).send({
                error: "Internal Server Error",
                message: "Login failed"
            });
        }
    });

    return router;
}