import React, { useState, useRef, useEffect } from "react";
import { ShieldCheck } from "lucide-react";

interface OtpModalProps {
    email: string;
    onClose: () => void;
    onVerify: (otp: string) => void;
    onResend: () => void;
}

export default function OtpModal({ email, onClose, onVerify, onResend }: OtpModalProps) {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [countdown, setCountdown] = useState(30);

    useEffect(() => {
        if (countdown === 0) return;

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown]);

    const handleResend = () => {
        if (countdown > 0) return;

        onResend();
        setCountdown(30);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value !== "" && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && otp[index] === "" && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = () => {
        onVerify(otp.join(""));
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                >
                    ✕
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify Identity</h2>
                    <p className="text-sm text-slate-500">
                        Please enter the 6-digit code sent to <br />
                        <span className="font-semibold text-slate-700">{email}</span>
                    </p>
                </div>

                <div className="flex justify-between gap-2 mb-8">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => {
                                otpRefs.current[index] = el;
                            }}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            className="w-12 h-14 text-center text-xl font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 bg-slate-50"
                        />
                    ))}
                </div>

                <button
                    onClick={handleVerify}
                    disabled={otp.join("").length !== 6}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ShieldCheck className="w-5 h-5" />
                    Verify OTP
                </button>

                <div className="mt-6 text-center text-sm">
                    <span className="text-slate-500">Didn't receive code? </span>

                    <button
                        onClick={handleResend}
                        disabled={countdown > 0}
                        className={`font-medium transition-colors ${
                            countdown > 0
                                ? "text-slate-400 cursor-not-allowed"
                                : "text-blue-600 hover:text-blue-800"
                        }`}
                    >
                        {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                    </button>
                </div>
            </div>
        </div>
    );
}
