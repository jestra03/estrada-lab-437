import React, { useActionState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";

interface ILoginPageProps {
    isRegistering?: boolean;
    onAuthSuccess: (token: string) => void;
}

export function LoginPage({ isRegistering = false, onAuthSuccess }: ILoginPageProps) {
    const usernameInputId = React.useId();
    const passwordInputId = React.useId();
    const navigate = useNavigate();

    async function handleAuthAction(_prevState: any, formData: FormData) {
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;

        if (!username || !password) {
            return { error: "Please fill in all fields" };
        }

        try {
            const endpoint = isRegistering ? "/auth/register" : "/auth/login";
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                onAuthSuccess(data.token);
                navigate("/");
                return { success: true };
            } else {
                const errorData = await response.json();
                return { error: errorData.message || "Authentication failed" };
            }
        } catch (err) {
            console.error(err);
            return { error: "Network error. Please try again." };
        }
    }

    const [result, formAction, isPending] = useActionState(handleAuthAction, null);

    return (
        <>
            <h2>{isRegistering ? "Register a new account" : "Login"}</h2>
            <form className="LoginPage-form" action={formAction}>
                <label htmlFor={usernameInputId}>Username</label>
                <input
                    id={usernameInputId}
                    name="username"
                    required
                    disabled={isPending}
                />

                <label htmlFor={passwordInputId}>Password</label>
                <input
                    id={passwordInputId}
                    name="password"
                    type="password"
                    required
                    disabled={isPending}
                />

                <input
                    type="submit"
                    value={isPending ? "Processing..." : (isRegistering ? "Register" : "Submit")}
                    disabled={isPending}
                />

                {result?.error && (
                    <p style={{ color: "red" }} aria-live="polite">
                        {result.error}
                    </p>
                )}
            </form>

            {!isRegistering && (
                <p>
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            )}

            {isRegistering && (
                <p>
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            )}
        </>
    );
}