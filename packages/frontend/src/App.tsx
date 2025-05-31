import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { AllImages } from "./images/AllImages.tsx";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { MainLayout } from "./MainLayout.tsx";
import { ValidRoutes } from "../../backend/src/shared/ValidRoutes";
import { fetchDataFromServer } from "./MockAppData.ts";

function App() {
    const [images] = useState(fetchDataFromServer);

    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route path={ValidRoutes.HOME} element={<AllImages images={images} />} />
                <Route path={ValidRoutes.UPLOAD} element={<UploadPage />} />
                <Route path={ValidRoutes.LOGIN} element={<LoginPage />} />
                <Route path={ValidRoutes.IMAGE_DETAILS} element={<ImageDetails images={images} />} />
            </Route>
        </Routes>
    );
}

export default App;
