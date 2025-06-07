import type {IApiImageData} from "../../../backend/src/shared/ApiImageData";
import { ImageGrid } from "./ImageGrid";

interface Props {
    images: IApiImageData[];
    loading: boolean;
    error: boolean;
    searchPanel: React.ReactNode;
}

export function AllImages({ images, loading, error, searchPanel }: Props) {
    if (loading) return (
        <>
            {searchPanel}
            <p>Loading images...</p>
        </>
    );

    if (error) return (
        <>
            {searchPanel}
            <p>Failed to load images.</p>
        </>
    );

    return (
        <>
            <h2>All Images</h2>
            {searchPanel}
            <ImageGrid images={images} />
        </>
    );
}