import { useParams } from "react-router-dom";
import type {IImageData} from "../MockAppData.ts";

interface Props {
    images: IImageData[];
}

export function ImageDetails({ images }: Props) {
    const { imageId } = useParams();
    const image = images.find((img) => img.id === imageId);

    if (!image) {
        return <p>Image not found.</p>;
    }

    return (
        <div>
            <h2>{image.name}</h2>
            <img src={image.src} alt={image.name} style={{ maxWidth: "500px" }} />
            <p>
                Uploaded by: <strong>{image.author.username}</strong>
            </p>
        </div>
    );
}
