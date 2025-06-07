// src/routes/imageRoutes.ts

import express from "express";
import { ImageProvider } from "../ImageProvider";
import { ObjectId } from "mongodb";
import { imageMiddlewareFactory, handleImageFileErrors } from "../middleware/imageUploadMiddleware";

/**
 * createImageRouter:
 *   - Returns an express.Router() that handles:
 *     GET  /         → list or search images
 *     PATCH /:id     → update an image's name
 *     POST /         → upload new image
 */
export function createImageRouter(imageProvider: ImageProvider) {
    const router = express.Router();

    // 1) GET /api/images?name=optionalString
    router.get("/", async (req: any, res: any) => {
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
    router.patch("/:id", async (req: any, res: any) => {
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

        try {
            // Check if image exists and get its details
            const image = await imageProvider.getImageById(id);
            if (!image) {
                return res.status(404).send({
                    error: "Not Found",
                    message: "Image does not exist"
                });
            }

            // Check ownership - req.user is set by auth middleware
            const loggedInUsername = req.user?.username;
            if (!loggedInUsername) {
                return res.status(401).send({
                    error: "Unauthorized",
                    message: "Authentication required"
                });
            }

            // Get the author's username from the authorId
            const authorDoc = await imageProvider.getUserById(image.authorId.toString());
            const imageAuthorUsername = authorDoc?.username;

            if (loggedInUsername !== imageAuthorUsername) {
                return res.status(403).send({
                    error: "Forbidden",
                    message: "You can only edit your own images"
                });
            }

            // Attempt update
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

    // 3) POST /api/images - Upload new image
    router.post(
        "/",
        imageMiddlewareFactory.single("image"),
        handleImageFileErrors,
        async (req: any, res: any) => {
            // Check if we have both file and name
            if (!req.file || !req.body.name) {
                return res.status(400).send({
                    error: "Bad Request",
                    message: "Missing image file or name"
                });
            }

            const { filename } = req.file;
            const { name } = req.body;
            const authorUsername = req.user?.username;

            if (!authorUsername) {
                return res.status(401).send({
                    error: "Unauthorized",
                    message: "Authentication required"
                });
            }

            try {
                // Create the image document
                const src = `/uploads/${filename}`;
                await imageProvider.createImage(src, name, authorUsername);

                return res.status(201).send();
            } catch (err) {
                console.error("Image creation failed:", err);
                return res.status(500).send({
                    error: "Internal Server Error",
                    message: "Failed to create image"
                });
            }
        }
    );

    return router;
}