import React from "react";
import { Navigate } from "react-router-dom";

interface IProtectedRouteProps {
    authToken: string;
    children: React.ReactNode;
}

export function ProtectedRoute({ authToken, children }: IProtectedRouteProps) {
    if (!authToken) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>;
}