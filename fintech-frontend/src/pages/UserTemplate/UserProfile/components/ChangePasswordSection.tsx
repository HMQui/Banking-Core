import { useState } from "react";
import { authService } from "../../../../api/authService";
import { toast } from "../../../../components/common/Toast/toastManager";
import OtpModal from "../../../../components/common/OtpModal";
import { isAxiosError } from "axios";

interface ChangePasswordSectionProps {
    email: string;
}

export default function ChangePasswordSection({ email }: ChangePasswordSectionProps) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showOtpModal, setShowOtpModal] = useState(false);

    const validateForm = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("All password fields are required.");
            return false;
        }
        if (newPassword.length < 8) {
            setError("New password must be at least 8 characters long.");
            return false;
        }
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return false;
        }
        return true;
    };

    const handleInitChange = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        setError("");

        try {
            await authService.resetPasswordInit(email, currentPassword);
            setShowOtpModal(true);
            toast.success("OTP Sent", "Please check your email for the verification code.");
        } catch (err: unknown) {
            console.error(err);

            if (isAxiosError(err) && err.response) {
                const status = err.response.status;
                // Optionally extract the specific error message from the backend response
                const serverMessage = err.response.data?.message;

                switch (status) {
                    case 401:
                        toast.error("Unauthorized", "Invalid current password.");
                        setError("Invalid current password. Please try again.");
                        break;
                    case 403:
                        toast.error("Action Denied", "Your account is locked.");
                        setError("Account is locked. Contact support.");
                        break;
                    case 404:
                        toast.error("Not Found", "User does not exist.");
                        setError("User not found.");
                        break;
                    default:
                        toast.error(
                            "Action Failed",
                            serverMessage || "Could not initiate password change.",
                        );
                        setError(serverMessage || "An error occurred. Please try again.");
                }
            } else {
                // Fallback for network errors or non-axios errors
                toast.error("Action Failed", "An unexpected error occurred.");
                setError("Network error or unexpected issue occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (otp: string) => {
        try {
            await authService.resetPasswordVerify(email, otp, newPassword);
            toast.success("Password Updated", "Your password has been changed successfully.");

            // Reset form
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setShowOtpModal(false);
        } catch (err) {
            console.error(err);
            toast.error("Verification Failed", "Invalid or expired OTP.");
        }
    };

    const handleResendOtp = async () => {
        // try {
        //     await authService.resetPasswordInit(email, currentPassword);
        //     toast.success("OTP Resent", "A new verification code has been sent.");
        // } catch {
        //     toast.error("Action Failed", "Could not resend OTP.");
        // }
    };

    return (
        <>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Change Password</h2>

                <div className="grid grid-cols-1 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Current Password
                        </label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => {
                                setCurrentPassword(e.target.value);
                                setError("");
                            }}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-sm text-slate-800 font-mono tracking-widest placeholder:tracking-normal"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    setError("");
                                }}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-sm text-slate-800 font-mono tracking-widest placeholder:tracking-normal"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setError("");
                                }}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-sm text-slate-800 font-mono tracking-widest placeholder:tracking-normal"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                </div>

                {error && <div className="mt-4 text-sm text-red-500">{error}</div>}

                <div className="flex justify-end mt-8">
                    <button
                        onClick={handleInitChange}
                        disabled={isLoading}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                    >
                        {isLoading ? "Processing..." : "Update Password"}
                    </button>
                </div>
            </div>

            {showOtpModal && (
                <OtpModal
                    email={email}
                    onClose={() => setShowOtpModal(false)}
                    onVerify={handleVerifyOtp}
                    onResend={handleResendOtp}
                />
            )}
        </>
    );
}
