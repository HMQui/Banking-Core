/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { useSelector } from "react-redux";
import { store } from "./store";
import { router } from "./routes";
import { useAppDispatch, useAppSelector } from "./hooks/redux";
import type { LoadingState } from "./store/slices/loadingSlice";
import { refreshThunk } from "./store/slices/authSlice";
import Loading from "./components/common/Loading";
import { injectStore } from "./api/axiosClient";
import "./index.css";
import { initDPoPKeys } from "./utils/dpopService";
import ToastContainer from "./components/common/Toast/ToastContainer";

injectStore(store);

interface ReduxState {
    loading: LoadingState;
}

function AppContent() {
    const dispatch = useAppDispatch();
    const { isLoading: isGlobalLoading } = useSelector((state: ReduxState) => state.loading);
    const { accessToken } = useAppSelector((state) => state.auth);

    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        const initSession = async () => {
            await initDPoPKeys();
            const refreshToken = localStorage.getItem("refresh_token");

            if (!accessToken && refreshToken) {
                try {
                    await dispatch(refreshThunk(refreshToken)).unwrap();
                } catch (error) {
                    console.error("Silent refresh failed. User needs to re-login.");
                    console.log(error);
                }
            }
            setIsInitializing(false);
        };

        initSession();
    }, []);

    if (isInitializing) {
        return <Loading />;
    }

    return (
        <>
            {isGlobalLoading && <Loading />}
            <RouterProvider router={router} />
        </>
    );
}

export default function App() {
    return (
        <>
            <AppContent />

            <ToastContainer />
        </>
    );
}
