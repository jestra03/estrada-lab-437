import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { AllImages } from "./images/AllImages";
import { ImageDetails } from "./images/ImageDetails";
import { UploadPage } from "./UploadPage";
import { LoginPage } from "./LoginPage";
import { MainLayout } from "./MainLayout";
import { ValidRoutes } from "../../backend/src/shared/ValidRoutes";
import type {IApiImageData} from "../../backend/src/shared/ApiImageData";

function App() {
    const [images, setImages] = useState<IApiImageData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch("/api/images")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.json();
            })
            .then((data) => setImages(data))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<AllImages images={images} loading={loading} error={error} />} />
                <Route path={ValidRoutes.UPLOAD} element={<UploadPage />} />
                <Route path={ValidRoutes.LOGIN} element={<LoginPage />} />
                <Route
                    path={ValidRoutes.IMAGE_DETAILS}
                    element={
                        <ImageDetails
                            images={images}
                            loading={loading}
                            error={error}
                            setImages={setImages}
                        />
                    }
                />

            </Route>
        </Routes>
    );
}

export default App;
