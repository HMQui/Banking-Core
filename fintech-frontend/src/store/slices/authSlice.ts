import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService, type LoginPayload } from "../../api/authService";
import { type UserProfile } from "../../types/user";
import { clearDPoPKeys } from "../../utils/dpop";

export interface AuthState {
    user: UserProfile | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

export const loginThunk = createAsyncThunk(
    "auth/login",
    async (credentials: LoginPayload, { rejectWithValue }) => {
        try {
            const response = await authService.login(credentials);
            localStorage.setItem("refresh_token", response.refreshToken);
            return response;
        } catch (error) {
            await clearDPoPKeys();
            if (error instanceof Error) return rejectWithValue(error.message);
            return rejectWithValue("Login failed");
        }
    },
);

export const refreshThunk = createAsyncThunk(
    "auth/refresh",
    async (refreshToken: string, { rejectWithValue }) => {
        try {
            const response = await authService.refresh(refreshToken);
            localStorage.setItem("refresh_token", response.refreshToken);
            return response;
        } catch (error) {
            if (error instanceof Error) return rejectWithValue(error.message);
            return rejectWithValue("Refresh failed");
        }
    },
);

export const logoutThunk = createAsyncThunk("auth/logout", async ( _, { rejectWithValue }) => {
    try {
        await authService.logout();
        localStorage.removeItem("refresh_token");
        return true;
    } catch (error) {
        if (error instanceof Error) return rejectWithValue(error.message);
        return rejectWithValue("Logout failed");
    }
});

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(loginThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.accessToken = action.payload.accessToken;
                state.user = action.payload.user;
                state.isAuthenticated = true;
            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.user = null;
                state.accessToken = null;
                state.isAuthenticated = false;
            })
            .addCase(refreshThunk.fulfilled, (state, action) => {
                state.accessToken = action.payload.accessToken;
                state.user = action.payload.user;
                state.isAuthenticated = true;
            })
            .addCase(refreshThunk.rejected, (state) => {
                localStorage.removeItem("refresh_token");
                state.user = null;
                state.accessToken = null;
                state.isAuthenticated = false;
            })
            .addCase(logoutThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(logoutThunk.fulfilled, (state) => {
                state.isLoading = false;
                state.user = null;
                state.accessToken = null;
                state.isAuthenticated = false;
                state.error = null;
            })
            .addCase(logoutThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.user = null;
                state.accessToken = null;
                state.isAuthenticated = false;
            });
    },
});

export default authSlice.reducer;
