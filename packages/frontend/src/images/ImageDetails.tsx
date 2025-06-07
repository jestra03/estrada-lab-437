import { useParams } from "react-router-dom";
import type {IApiImageData} from "../../../backend/src/shared/ApiImageData";
import { ImageNameEditor } from "./ImageNameEditor";

interface Props {
    images: IApiImageData[];
    loading: boolean;
    error: boolean;
    setImages: React.Dispatch<React.SetStateAction<IApiImageData[]>>;
    authToken: string;
}

export function ImageDetails({ images, loading, error, setImages, authToken }: Props) {
    const { imageId } = useParams();
    const image = images.find((img) => img.id === imageId);

    if (loading) return <p>Loading image...</p>;
    if (error) return <p>Failed to load image data.</p>;
    if (!image) return <p>Image not found.</p>;

    return (
        <div>
            <h2>{image.name}</h2>
            <img src={image.src} alt={image.name} style={{ maxWidth: "500px" }} />
            <p>
                Uploaded by: <strong>{image.author.username}</strong>
            </p>
            <ImageNameEditor
                initialValue={image.name}
                imageId={image.id}
                setImages={setImages}
                authToken={authToken}
            />
        </div>
    );
}