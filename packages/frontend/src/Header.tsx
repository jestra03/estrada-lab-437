import "./Header.css";
import { ValidRoutes } from "../../backend/src/shared/ValidRoutes";
import { Link } from "react-router-dom";

export function Header() {
    return (
        <header>
            <h1>My cool image site</h1>
            <div>
                <label>
                    Some switch (dark mode?) <input type="checkbox" />
                </label>
                <nav>
                    <Link to={ValidRoutes.HOME}>Home</Link>
                    <Link to={ValidRoutes.UPLOAD}>Upload</Link>
                    <Link to={ValidRoutes.LOGIN}>Log in</Link>
                </nav>
            </div>
        </header>
    );
}
