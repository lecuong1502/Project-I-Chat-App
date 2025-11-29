import React, { Children } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const isAuth = localStorage.getItem("isLoggedIn");

    return isAuth ? children : <Navigate to="/" replace />
};

export default ProtectedRoute;