import { useState, useRef, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import { AllImages } from "./images/AllImages";
import { ImageDetails } from "./images/ImageDetails";
import { UploadPage } from "./UploadPage";
import { LoginPage } from "./LoginPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { ImageSearchForm } from "./images/ImageSearchForm";
import { MainLayout } from "./MainLayout";
import { ValidRoutes } from "../../backend/src/shared/ValidRoutes";
import type {IApiImageData} from "../../backend/src/shared/ApiImageData";

function App() {
    // Auth state
    const [authToken, setAuthToken] = useState<string>("");

    // Image data state
    const [images, setImages] = useState<IApiImageData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

    // Search state
    const [searchString, setSearchString] = useState<string>("");

    // Race condition prevention
    const requestNumberRef = useRef(0);

    const fetchImages = useCallback(async (searchQuery?: string) => {
        if (!authToken) return; // Don't fetch if not authenticated

        setLoading(true);
        setError(false);

        // Increment request number for race condition handling
        requestNumberRef.current += 1;
        const thisRequestNumber = requestNumberRef.current;

        try {
            const url = searchQuery
                ? `/api/images?name=${encodeURIComponent(searchQuery)}`
                : "/api/images";

            const response = await fetch(url, {
                headers: {
                    "Authorization": `Bearer ${authToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();

                // Check if this is still the most recent request
                if (thisRequestNumber === requestNumberRef.current) {
                    setImages(data);
                    setLoading(false);
                }
            } else {
                if (thisRequestNumber === requestNumberRef.current) {
                    setError(true);
                    setLoading(false);
                }
            }
        } catch (err) {
            console.error(err);
            if (thisRequestNumber === requestNumberRef.current) {
                setError(true);
                setLoading(false);
            }
        }
    }, [authToken]);

    // Handle authentication success
    const handleAuthSuccess = (token: string) => {
        setAuthToken(token);
        // Immediately fetch images after successful auth
        setTimeout(() => {
            fetchImages();
        }, 0);
    };

    // Handle image search
    const handleImageSearch = () => {
        fetchImages(searchString);
    };

    // Handle search string change
    const handleSearchStringChange = (newSearchString: string) => {
        setSearchString(newSearchString);
    };

    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route
                    index
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <AllImages
                                images={images}
                                loading={loading}
                                error={error}
                                searchPanel={
                                    <ImageSearchForm
                                        searchString={searchString}
                                        onSearchStringChange={handleSearchStringChange}
                                        onSearchRequested={handleImageSearch}
                                    />
                                }
                            />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={ValidRoutes.UPLOAD}
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <UploadPage authToken={authToken} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={ValidRoutes.LOGIN}
                    element={<LoginPage onAuthSuccess={handleAuthSuccess} />}
                />
                <Route
                    path="/register"
                    element={<LoginPage isRegistering={true} onAuthSuccess={handleAuthSuccess} />}
                />
                <Route
                    path={ValidRoutes.IMAGE_DETAILS}
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <ImageDetails
                                images={images}
                                loading={loading}
                                error={error}
                                setImages={setImages}
                                authToken={authToken}
                            />
                        </ProtectedRoute>
                    }
                />
            </Route>
        </Routes>
    );
}

export default App;