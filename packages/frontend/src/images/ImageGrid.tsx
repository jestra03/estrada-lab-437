import { Link } from "react-router-dom";
import type {IApiImageData} from "../../../backend/src/shared/ApiImageData";

interface Props {
    images: IApiImageData[];
}

export function ImageGrid({ images }: Props) {
    return (
        <div className="image-grid">
            {images.map((img) => (
                <Link key={img.id} to={`/images/${img.id}`}>
                    <img src={img.src} alt={img.name} style={{ maxWidth: "200px" }} />
                </Link>
            ))}
        </div>
    );
}