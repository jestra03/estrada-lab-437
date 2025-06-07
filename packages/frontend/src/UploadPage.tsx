import React, { useState, useActionState } from "react";

interface IUploadPageProps {
    authToken: string;
}

function readAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.readAsDataURL(file);
        fr.onload = () => resolve(fr.result as string);
        fr.onerror = (err) => reject(err);
    });
}

export function UploadPage({ authToken }: IUploadPageProps) {
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const fileInputId = React.useId(); // Add unique ID for accessibility

    async function handleUpload(_prevState: any, formData: FormData) {
        const imageFile = formData.get("image") as File;
        const imageName = formData.get("name") as string;

        if (!imageFile || !imageName) {
            return { error: "Please fill in all fields and select an image" };
        }

        try {
            const uploadFormData = new FormData();
            uploadFormData.append("image", imageFile);
            uploadFormData.append("name", imageName);

            const response = await fetch("/api/images", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${authToken}`
                },
                body: uploadFormData
            });

            if (response.ok) {
                return { success: "Image uploaded successfully!" };
            } else {
                const errorData = await response.json();
                return { error: errorData.message || "Upload failed" };
            }
        } catch (err) {
            console.error(err);
            return { error: "Network error. Please try again." };
        }
    }

    const [result, formAction, isPending] = useActionState(handleUpload, null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const dataUrl = await readAsDataURL(file);
                setPreviewUrl(dataUrl);
            } catch (err) {
                console.error("Failed to read file:", err);
            }
        }
    };

    return (
        <>
            <h2>Upload New Image</h2>

            <form action={formAction}>
                <div style={{ marginBottom: "1rem" }}>
                    <label htmlFor={fileInputId}>
                        Choose image to upload:
                        <input
                            id={fileInputId}
                            name="image"
                            type="file"
                            accept=".png,.jpg,.jpeg"
                            required
                            disabled={isPending}
                            onChange={handleFileChange}
                            style={{ marginLeft: "0.5rem" }}
                        />
                    </label>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <label>
                        <span>Image title: </span>
                        <input
                            name="name"
                            required
                            disabled={isPending}
                            style={{ marginLeft: "0.5rem", padding: "0.25rem" }}
                        />
                    </label>
                </div>

                {previewUrl && (
                    <div style={{ marginBottom: "1rem" }}>
                        <p>Preview:</p>
                        <img
                            style={{
                                width: "20em",
                                maxWidth: "100%",
                                border: "1px solid #ccc"
                            }}
                            src={previewUrl}
                            alt="Upload preview"
                        />
                    </div>
                )}

                <div>
                    <input
                        type="submit"
                        value={isPending ? "Uploading..." : "Confirm upload"}
                        disabled={isPending}
                        style={{ padding: "0.5rem 1rem" }}
                    />

                    {result?.error && (
                        <p style={{ color: "red" }} aria-live="polite">
                            {result.error}
                        </p>
                    )}

                    {result?.success && (
                        <p style={{ color: "green" }} aria-live="polite">
                            {result.success}
                        </p>
                    )}
                </div>
            </form>
        </>
    );
}