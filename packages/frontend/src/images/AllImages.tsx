import type {IImageData} from "../MockAppData.ts";
import { ImageGrid } from "./ImageGrid.tsx";

interface Props {
    images: IImageData[];
}

export function AllImages({ images }: Props) {
    return (
        <>
            <h2>All Images</h2>
            <ImageGrid images={images} />
        </>
    );
}
