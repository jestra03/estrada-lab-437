import { useState } from "react";
import type {IApiImageData} from "../../../backend/src/shared/ApiImageData.ts";

interface INameEditorProps {
    initialValue: string;
    imageId: string;
    setImages: (updater: (prev: any) => any) => void; // assumes lifted setImages is passed
}

export function ImageNameEditor({ initialValue, imageId, setImages }: INameEditorProps) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [input, setInput] = useState(initialValue);
    const [working, setWorking] = useState(false);
    const [error, setError] = useState(false);

    async function handleSubmitPressed() {
        setWorking(true);
        setError(false);

        try {
            const res = await fetch("/api/images"); // fake fetch
            if (!res.ok) throw new Error("Bad response");

            // Simulate update in parent state
            setImages(prev =>
                prev.map((img: IApiImageData) =>
                    img.id === imageId ? { ...img, name: input } : img
                )
            );

            setIsEditingName(false);
        } catch (err) {
            setError(true);
            console.error(err);
        } finally {
            setWorking(false);
        }
    }

    if (isEditingName) {
        return (
            <div style={{ margin: "1em 0" }}>
                <label>
                    New Name{" "}
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={working}
                    />
                </label>
                <button disabled={input.length === 0 || working} onClick={handleSubmitPressed}>
                    Submit
                </button>
                <button onClick={() => setIsEditingName(false)} disabled={working}>
                    Cancel
                </button>
                {working && <p>Working...</p>}
                {error && <p style={{ color: "red" }}>Failed to update name.</p>}
            </div>
        );
    } else {
        return (
            <div style={{ margin: "1em 0" }}>
                <button onClick={() => setIsEditingName(true)}>Edit name</button>
            </div>
        );
    }
}
