import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { createDPoPProof } from "../utils/dpopService";
import type { Store } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "../store/index";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

let store: Store<RootState>;

export const injectStore = (_store: Store<RootState>) => {
    store = _store;
};

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Ensures only one refresh request runs at a time
let refreshPromise: Promise<string> | null = null;

axiosClient.interceptors.request.use(
    async (config: CustomAxiosRequestConfig) => {
        const token = store?.getState()?.auth?.accessToken;

        let payloadString: string | undefined;

        if (config.data && ["post", "put", "patch"].includes(config.method?.toLowerCase() || "")) {
            payloadString =
                typeof config.data === "string" ? config.data : JSON.stringify(config.data);

            config.data = payloadString;
        }

        if (token) {
            config.headers.Authorization = `DPoP ${token}`;
        }

        if (config.url && config.method) {
            const fullUrl = config.url.startsWith("http") ? config.url : BASE_URL + config.url;

            const proof = await createDPoPProof({
                url: fullUrl,
                method: config.method,
                accessToken: token ?? undefined,
                payloadString,
            });

            config.headers["DPoP"] = proof;
        }

        return config;
    },
    (error) => Promise.reject(error),
);

axiosClient.interceptors.response.use(
    (response) => response.data.data,
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        // Prevent intercepting 401 errors from core auth routes to avoid infinite loop
        const isAuthRoute =
            originalRequest.url?.includes("/auth/login") ||
            originalRequest.url?.includes("/auth/logout") ||
            originalRequest.url?.includes("/auth/refresh");

        if (error.response?.status === 401 && isAuthRoute) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem("refresh_token");

            if (!refreshToken) {
                const { logoutThunk } = await import("../store/slices/authSlice");
                if (store) (store.dispatch as AppDispatch)(logoutThunk());
                return Promise.reject(error);
            }

            if (!refreshPromise) {
                refreshPromise = (async () => {
                    try {
                        const { refreshThunk, logoutThunk } =
                            await import("../store/slices/authSlice");

                        const dispatch = store.dispatch as AppDispatch;

                        const resultAction = await dispatch(refreshThunk(refreshToken));

                        if (refreshThunk.fulfilled.match(resultAction)) {
                            return resultAction.payload.accessToken;
                        }

                        await dispatch(logoutThunk());
                        throw new Error("Refresh token expired or invalid");
                    } finally {
                        refreshPromise = null;
                    }
                })();
            }

            try {
                await refreshPromise;
                return axiosClient(originalRequest);
            } catch (retryError) {
                return Promise.reject(retryError);
            }
        }

        return Promise.reject(error);
    },
);

export default axiosClient;
