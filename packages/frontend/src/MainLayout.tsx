import { Outlet } from "react-router-dom";
import { Header } from "./Header.tsx";

export function MainLayout() {
    return (
        <>
            <Header />
            <main style={{ padding: "1em" }}>
                <Outlet />
            </main>
        </>
    );
}
