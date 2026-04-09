import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import AuthGuard from "../components/Guards/AuthGuard";
import GuestGuard from "../components/Guards/GuestGuard";
import SuspenseWrapper from "./SuspenseWrapper";

const HomeRedirect = lazy(() => import("../components/Guards/HomeRedirect"));

const UserTemplate = lazy(() => import("../pages/UserTemplate"));
const AdminTemplate = lazy(() => import("../pages/AdminTemplate"));
const NotFound = lazy(() => import("../pages/NotFound"));

const AuthPage = lazy(() => import("../pages/AuthPage"));
const Dashboard = lazy(() => import("../pages/UserTemplate/Dashboard"));
const AccountManagement = lazy(() => import("../pages/UserTemplate/AccountManagement"));
const Beneficiaries = lazy(() => import("../pages/UserTemplate/Beneficiaries"));
const UserProfile = lazy(() => import("../pages/UserTemplate/UserProfile"));
const TransactionHistory = lazy(() => import("../pages/UserTemplate/TransactionHistoryPage"));
const TransactionPage = lazy(() => import("../pages/UserTemplate/Transaction"));

const AdminAuth = lazy(() => import("../pages/AuthPage/AdminAuth"));
const AdminDashboard = lazy(() => import("../pages/AdminTemplate/AdminDashboard"));
const SecurityLogs = lazy(() => import("../pages/AdminTemplate/SecurityLogs"));
const UserManagement = lazy(() => import("../pages/AdminTemplate/UserManagement"));

export const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <SuspenseWrapper>
                <HomeRedirect />
            </SuspenseWrapper>
        ),
    },
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
                <AuthGuard />
            </SuspenseWrapper>
        ),
        children: [
            {
                element: (
                    <SuspenseWrapper>
                        <UserTemplate />
                    </SuspenseWrapper>
                ),
                children: [
                    {
                        path: "/dashboard",
                        element: (
                            <SuspenseWrapper>
                                <Dashboard />
                            </SuspenseWrapper>
                        ),
                    },
                    {
                        path: "/beneficiaries",
                        element: (
                            <SuspenseWrapper>
                                <Beneficiaries />
                            </SuspenseWrapper>
                        ),
                    },
                    {
                        path: "/me",
                        element: (
                            <SuspenseWrapper>
                                <UserProfile />
                            </SuspenseWrapper>
                        ),
                    },
                    {
                        path: "statements",
                        element: (
                            <SuspenseWrapper>
                                <TransactionHistory />
                            </SuspenseWrapper>
                        ),
                    },
                    {
                        path: "/transactions",
                        element: (
                            <SuspenseWrapper>
                                <TransactionPage />
                            </SuspenseWrapper>
                        ),
                    },
                    {
                        path: "/accounts-management",
                        element: (
                            <SuspenseWrapper>
                                <AccountManagement />
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
