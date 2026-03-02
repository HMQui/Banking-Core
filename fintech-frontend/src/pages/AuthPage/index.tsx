import { useState } from "react";
import AuthHeader from "./LayOut/AuthHeader";
import AuthFooter from "./LayOut/AuthFooter";
import AuthForm from "./components/AuthForm";
import OtpModal from "./components/OtpModal";
import { useAppDispatch } from "../../hooks/redux";
import { loginThunk } from "../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { authService } from "../../api/authService";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [showOTP, setShowOTP] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState("");
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleLoginSubmit = async (email: string, password: string) => {
        try {
            const deviceName = navigator.platform || "Unknown Device";
            const userAgent = navigator.userAgent || "Unknown User Agent";
            await dispatch(loginThunk({ email, password, deviceName, userAgent }));
            navigate("/");
        } catch (error) {
            if (error instanceof Error) {
                console.error("Login error:", error.message);
            } else {
                console.error("Login error:", error);
            }
        }
    };

    const handleRegisterInit = async (email: string, password: string, fullName: string) => {
        try {
            await authService.registerInit(email, password, fullName);
            setRegisteredEmail(email);
            setShowOTP(true);
        } catch (error) {
            if (error instanceof Error) {
                console.error("Register error:", error.message);
            } else {
                console.error("Register error:", error);
            }
        }
    };

    const handleVerifyOtp = async (otp: string) => {
        try {
            await authService.registerVerify(registeredEmail, otp);
            setShowOTP(false);
            setIsLogin(true);
        } catch (error) {
            if (error instanceof Error) {
                console.error("OTP verification error:", error.message);
            } else {
                console.error("OTP verification error:", error);
            }
        }
    };

    const handleResend = async () => {};

    const handleAuthSubmit = async (email: string, password: string, fullName?: string) => {
        if (isLogin) {
            handleLoginSubmit(email, password);
        } else {
            handleRegisterInit(email, password, fullName || "");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
            <AuthHeader />

            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white p-8 shadow-lg rounded-xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">
                            {isLogin ? "Welcome back" : "Create account"}
                        </h1>
                        <p className="text-slate-500">
                            {isLogin
                                ? "Secure access to your core banking portal."
                                : "Register to access secure banking services."}
                        </p>
                    </div>

                    <AuthForm
                        isLogin={isLogin}
                        onToggleMode={() => setIsLogin(!isLogin)}
                        onSubmitForm={handleAuthSubmit}
                    />
                </div>
            </main>

            <AuthFooter />

            {showOTP && (
                <OtpModal
                    email={registeredEmail}
                    onClose={() => setShowOTP(false)}
                    onVerify={handleVerifyOtp}
                    onResend={handleResend}
                />
            )}
        </div>
    );
}
