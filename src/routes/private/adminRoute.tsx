import { Outlet, Navigate } from "@tanstack/react-router";

const AdminRoute = () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user) {
        return <Navigate to="/auth/login" />;
    }

    if (user.role !== "admin" && user.role !== "admin-local") {
        return <Navigate to="/private/home" />;
    }

    return <Outlet />;
};

export default AdminRoute;