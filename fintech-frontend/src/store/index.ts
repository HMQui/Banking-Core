import { configureStore } from "@reduxjs/toolkit";
import loadingReducer from "./slices/loadingSlice";
import authReducer, { type AuthState } from "./slices/authSlice";

export interface RootReduxState {
    auth: AuthState;
    loading: {
        isLoading: boolean;
    };
}

export const store = configureStore({
    reducer: {
        loading: loadingReducer,
        auth: authReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
