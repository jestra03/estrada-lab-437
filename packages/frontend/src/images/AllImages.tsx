import type {IApiImageData} from "../../../backend/src/shared/ApiImageData";
import { ImageGrid } from "./ImageGrid";

interface Props {
    images: IApiImageData[];
    loading: boolean;
    error: boolean;
}

export function AllImages({ images, loading, error }: Props) {
    if (loading) return <p>Loading images...</p>;
    if (error) return <p>Failed to load images.</p>;

    return (
        <>
            <h2>All Images</h2>
            <ImageGrid images={images} />
        </>
    );
}
