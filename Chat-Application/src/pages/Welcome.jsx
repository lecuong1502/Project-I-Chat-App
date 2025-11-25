import React from "react";
import { Eye, EyeOff, MessageCircle } from "lucide-react"
import "./Welcome.css";
import { useState } from "react";
import iconLogo from "../assets/icon.png"
import { useNavigate } from "react-router-dom"

const Welcome = () => {
    const [showPassword, setShowPassword] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = (e) => {
        e.preventDefault();
    };

    return (
        <div className="welcome-container">
            <div className="content-wrapper">
                <div className="logo-container">
                    <img src={iconLogo} alt="Logo" className="app-logo"></img>
                </div>

                <h1 className="main-title">
                    A Wonderful Place <br />
                    <span className="gradient-text">Brings The World To You</span>
                </h1>

                <p className="sub-title">
                    Connect easily with friends, families and people who have same hobbies as you.
                </p>

                <div className="login-container" onSubmit={handleLogin}>
                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Email address..."
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group password-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password..."
                            className="input-field password-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="toggle-password-btn"
                            onClick={togglePasswordVisibility}
                            aria-label="Toggle password visibility"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <button type="submit" className="btn-primary btn-login">
                        Log In
                    </button>
                </div>

                <div className="divider">OR</div>

                <div className="action-buttons">
                    <button className="btn-primary">Login by Google</button>
                    <button type="button" className="btn-secondary" onClick={() => navigate("/signup")}>Create an new account</button>
                </div>
            </div>

            <footer className="footer">
                © LeCuong 2025.
            </footer>
        </div>
    );
}

export default Welcome