import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { AllImages } from "./images/AllImages.tsx";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { MainLayout } from "./MainLayout.tsx";
import { fetchDataFromServer } from "./MockAppData.ts";

function App() {
    const [images] = useState(fetchDataFromServer);

    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<AllImages images={images} />} />
                <Route path="upload" element={<UploadPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="images/:imageId" element={<ImageDetails images={images} />} />
            </Route>
        </Routes>
    );
}

export default App;
