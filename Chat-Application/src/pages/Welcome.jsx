import React from "react";
import { Eye, EyeOff, MessageCircle } from "lucide-react"
import "./Welcome.css";
import { useState } from "react";
import iconLogo from "../assets/icon.png"
import { useNavigate } from "react-router-dom"
import axios from "axios";

const Welcome = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false); // Thêm trạng thái loading

    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            alert("Please fill all fields!");
            return;
        }

        try {
            setLoading(true);
            
            const res = await axios.post("http://localhost:3001/api/login", {
                email: email,
                password: password
            });

            localStorage.setItem("user", JSON.stringify(res.data)); 
            
            // 3. Chuyển hướng
            alert("Login successful!");
            navigate("/main-board");
        } catch (error) {
            console.error();

            if (err.response && err.response.data) {
                alert(err.response.data.message); 
            } else {
                alert("Login failed! Please check server connection.");
            }
        } finally {
            setLoading(false);
        }
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

                <form className="login-container" onSubmit={handleLogin}>
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

                    <button type="submit" className="btn-primary btn-login" disabled={loading}>
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>

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