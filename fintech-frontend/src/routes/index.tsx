import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import AuthGuard from "../components/Guards/AuthGuard";
import SuspenseWrapper from "./SuspenseWrapper";
import GuestGuard from "../components/Guards/GuestGuard";

const UserTemplate = lazy(() => import("../pages/UserTemplate"));
const AdminTemplate = lazy(() => import("../pages/AdminTemplate"));
const NotFound = lazy(() => import("../pages/NotFound"));

const AuthPage = lazy(() => import("../pages/AuthPage"));
const Dashboard = lazy(() => import("../pages/UserTemplate/Dashboard"));
const Transactions = lazy(() => import("../pages/UserTemplate/Transactions"));
const Profile = lazy(() => import("../pages/UserTemplate/Profile"));

const AdminAuth = lazy(() => import("../pages/AuthPage/AdminAuth"));
const AdminDashboard = lazy(() => import("../pages/AdminTemplate/AdminDashboard"));
const SecurityLogs = lazy(() => import("../pages/AdminTemplate/SecurityLogs"));
const UserManagement = lazy(() => import("../pages/AdminTemplate/UserManagement"));

export const router = createBrowserRouter([
    {
        path: "/auth",
        element: (
            <SuspenseWrapper>
                <GuestGuard />
            </SuspenseWrapper>
        ),
        children: [
            {
                index: true,
                element: (
                    <SuspenseWrapper>
                        <AuthPage />
                    </SuspenseWrapper>
                ),
            },
        ],
    },
    {
        element: (
            <SuspenseWrapper>
                <UserTemplate />
            </SuspenseWrapper>
        ),
        children: [
            {
                element: (
                    <SuspenseWrapper>
                        <AuthGuard />
                    </SuspenseWrapper>
                ),
                children: [
                    {
                        index: true,
                        path: "/",
                        element: (
                            <SuspenseWrapper>
                                <Dashboard />
                            </SuspenseWrapper>
                        ),
                    },
                    {
                        path: "transactions",
                        element: (
                            <SuspenseWrapper>
                                <Transactions />
                            </SuspenseWrapper>
                        ),
                    },
                    {
                        path: "profile",
                        element: (
                            <SuspenseWrapper>
                                <Profile />
                            </SuspenseWrapper>
                        ),
                    },
                ],
            },
        ],
    },
    {
        path: "/admin/auth",
        element: (
            <SuspenseWrapper>
                <AdminAuth />
            </SuspenseWrapper>
        ),
    },
    {
        path: "/admin",
        element: (
            <SuspenseWrapper>
                <AuthGuard role="ADMIN" redirectPath="/admin/auth" />
            </SuspenseWrapper>
        ),
        children: [
            {
                element: (
                    <SuspenseWrapper>
                        <AdminTemplate />
                    </SuspenseWrapper>
                ),
                children: [
                    {
                        index: true,
                        element: (
                            <SuspenseWrapper>
                                <AdminDashboard />
                            </SuspenseWrapper>
                        ),
                    },
                    {
                        path: "logs",
                        element: (
                            <SuspenseWrapper>
                                <SecurityLogs />
                            </SuspenseWrapper>
                        ),
                    },
                    {
                        path: "users",
                        element: (
                            <SuspenseWrapper>
                                <UserManagement />
                            </SuspenseWrapper>
                        ),
                    },
                ],
            },
        ],
    },
    {
        path: "*",
        element: (
            <SuspenseWrapper>
                <NotFound />
            </SuspenseWrapper>
        ),
    },
]);
