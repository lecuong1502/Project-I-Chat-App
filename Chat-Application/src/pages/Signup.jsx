import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";
import { Eye, EyeOff, MessageCircle } from "lucide-react"
import iconLogo from "../assets/icon.png"

const Signup = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        birthday: "",
        phone: "",
        address: "",
        acceptedTerms: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Validate the email
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isValidPassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
        return passwordRegex.test(password);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!isValidEmail(formData.email)) {
            setError("Invalid email format! (Example: user@email.com)");
            return;
        }

        if (!isValidPassword(formData.password)) {
            setError("Password must be 8-20 characters, include uppercase, lowercase, number and special character!");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Confirm Password does not match!");
            return;
        }

        if (!formData.acceptedTerms) {
            setError("You must accept the Terms & Conditions to continue!");
            return;
        }

        // Call API and Save the account
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/register', { 
            method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                birthday: formData.birthday,
                phone: formData.phone,
                address: formData.address
            })
        });

        const newAccount = {
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName
        };
        localStorage.setItem("registeredUser", JSON.stringify(newAccount));

        setTimeout(() => {
            alert("Sign up successfully! Please login.");
            setIsLoading(false);
            navigate('/');
        }, 1000);
    } catch (err) {
        setIsLoading(false);
        setError("An error occurred during registration. Please try again.");
        console.error(err);
    }
};

return (
    <div className="signup-container">
        <div className="signup-left">
            <div className="image-placeholder">
                <h1>Image Area</h1>
            </div>
        </div>

        <div className="signup-right">
            <div className="form-wrapper">
                <div className="form-header">
                    <div className="logo-circle">
                        <img src={iconLogo} alt="Logo" id="logo" />
                    </div>
                    <h1>A Wonderful Place</h1>
                    <h2 className="gradient-text">Brings The World To You</h2>
                    <p className="sub-text">Join us and connect with friends today.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group-row">
                        <input
                            className="custom-input"
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            onChange={handleChange}
                            required
                        />
                        <input
                            className="custom-input"
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <input
                        className="custom-input full-width"
                        type="email"
                        name="email"
                        placeholder="Email address..."
                        onChange={handleChange}
                        required
                    />

                    <div className="password-wrapper">
                        <input
                            className="custom-input full-width"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password..."
                            onChange={handleChange}
                            required
                        />
                        <span
                            className="toggle-icon"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </span>
                    </div>

                    <div className="password-wrapper">
                        <input
                            className={`custom-input full-width ${error ? "input-error" : ""}`}
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Confirm Password..."
                            onChange={handleChange}
                            required
                        />
                        <span
                            className="toggle-icon"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </span>
                    </div>

                    {error && <p className="error-text">{error}</p>}

                    <div className="input-group-row">
                        <input
                            className="custom-input"
                            type="text"
                            onFocus={(e) => (e.target.type = "date")}
                            onBlur={(e) => (e.target.type = "text")}
                            name="birthday"
                            placeholder="Birthday"
                            onChange={handleChange}
                        />
                        <input
                            className="custom-input"
                            type="tel"
                            name="phone"
                            placeholder="Phone Number"
                            onChange={handleChange}
                        />
                    </div>

                    <input
                        className="custom-input full-width"
                        type="text"
                        name="address"
                        placeholder="Address"
                        onChange={handleChange}
                    />

                    <div className="terms-box">
                        <input
                            type="checkbox"
                            id="terms"
                            name="acceptedTerms"
                            onChange={handleChange}
                        />
                        <label htmlFor="terms">I accept the Terms & Conditions</label>
                    </div>

                    <button
                        type="submit"
                        className={`submit-btn pill-btn ${isLoading ? "disabled-btn" : ""}`}
                        disabled={isLoading}
                    >
                        {isLoading ? "Processing..." : "Create Account"}
                    </button>
                </form>

                <div className="divider">
                    <span>OR</span>
                </div>

                <div className="footer-action">
                    <p>Already have an account?</p>
                    <button className="login-again-btn" onClick={() => navigate("/")}>
                        Log In
                    </button>
                </div>
            </div>
        </div>
    </div>
);
};

export default Signup;