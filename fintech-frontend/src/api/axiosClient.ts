import axios from "axios";
import { createDPoPProof } from "../utils/dpop";
import type { Store } from "@reduxjs/toolkit";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
let store: Store;

// Inject Redux store to avoid circular dependency
export const injectStore = (_store: Store) => {
    store = _store;
};

const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosClient.interceptors.request.use(
    async (config) => {
        // Read Access Token directly from Redux Memory
        const token = store?.getState()?.auth?.accessToken;
        
        let payloadString: string | undefined = undefined;

        if (config.data && ["post", "put", "patch"].includes(config.method?.toLowerCase() || "")) {
            payloadString =
                typeof config.data === "string" ? config.data : JSON.stringify(config.data);
            config.data = payloadString;
        }

        if (token) {
            config.headers.Authorization = `DPoP ${token}`;
        }

        if (config.url && config.method) {
            const fullUrl = BASE_URL + config.url;
            
            const proof = await createDPoPProof({
                url: fullUrl,
                method: config.method,
                accessToken: token || undefined,
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
    (error) => Promise.reject(error),
);

export default axiosClient;
