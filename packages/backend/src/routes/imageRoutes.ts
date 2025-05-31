// src/routes/imageRoutes.ts

import express, { Request, Response } from "express";
import { ImageProvider } from "../ImageProvider";
import { ObjectId } from "mongodb";

/**
 * createImageRouter:
 *   - Returns an express.Router() that handles:
 *     GET  /         → list or search images
 *     PATCH /:id     → update an image's name
 */
export function createImageRouter(imageProvider: ImageProvider) {
    const router = express.Router();

    // 1) GET /api/images?name=optionalString
    router.get("/", async (req: Request, res: Response) => {
        // Read query parameter "name"
        const nameQuery = req.query.name;
        if (nameQuery !== undefined && typeof nameQuery !== "string") {
            return res.status(400).send({
                error: "Bad Request",
                message: "Query parameter 'name' must be a string"
            });
        }

        try {
            const images = await imageProvider.getAllImagesDenormalized(nameQuery);
            return res.json(images);
        } catch (err) {
            console.error("Failed to fetch images:", err);
            return res.status(500).json({ error: "Failed to fetch images" });
        }
    });

    // 2) PATCH /api/images/:id      { "name": "New Name" }
    router.patch("/:id", async (req: Request, res: Response) => {
        const { id } = req.params;
        const { name } = req.body;

        // Validate ID format
        if (!ObjectId.isValid(id)) {
            return res.status(404).send({
                error: "Not Found",
                message: "Image does not exist"
            });
        }

        // Validate name data
        if (typeof name !== "string") {
            return res.status(400).send({
                error: "Bad Request",
                message: "New image name must be a string"
            });
        }

        // Enforce max length = 100
        const MAX_NAME_LENGTH = 100;
        if (name.length > MAX_NAME_LENGTH) {
            return res.status(422).send({
                error: "Unprocessable Entity",
                message: `Image name exceeds ${MAX_NAME_LENGTH} characters`
            });
        }

        // Attempt update
        try {
            const updatedCount = await imageProvider.updateImageName(id, name);
            if (updatedCount === 0) {
                return res.status(404).send({
                    error: "Not Found",
                    message: "Image does not exist"
                });
            }
            // 204: No Content on success
            return res.status(204).send();
        } catch (err) {
            console.error("Update failed:", err);
            return res.status(500).send({
                error: "Internal Server Error",
                message: "An unexpected error occurred"
            });
        }
    });

    return router;
}
