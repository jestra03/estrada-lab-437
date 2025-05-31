import { Link } from "react-router-dom";
import type {IImageData} from "../MockAppData.ts";

interface Props {
    images: IImageData[];
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
