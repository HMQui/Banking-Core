import React, { useState } from "react";
import { Eye, EyeOff, User, Mail } from "lucide-react";

interface AuthFormProps {
    isLogin: boolean;
    onToggleMode: () => void;
    onSubmitForm: (email: string, password: string, fullName?: string) => void;
}

export default function AuthForm({ isLogin, onToggleMode, onSubmitForm }: AuthFormProps) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmitForm(email, password, isLogin ? undefined : fullName);
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Full Name
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                <User className="h-5 w-5" />
                            </div>
                            <input
                                type="text"
                                required={!isLogin}
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="block w-full pl-3 pr-10 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 sm:text-sm"
                                placeholder="Enter your full name"
                            />
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Email Address
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                            <Mail className="h-5 w-5" />
                        </div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-3 pr-10 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 sm:text-sm"
                            placeholder="Enter your email"
                        />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-slate-700">Password</label>
                        {isLogin && (
                            <a
                                href="#"
                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                                Forgot password?
                            </a>
                        )}
                    </div>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-3 pr-10 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 sm:text-sm"
                            placeholder="Enter your password"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 transition-colors mt-6"
                >
                    {isLogin ? "Sign In →" : "Register Account →"}
                </button>
            </form>

            <div className="mt-8 text-center text-sm">
                <span className="text-slate-500">
                    {isLogin ? "New user? " : "Already have an account? "}
                </span>
                <button
                    onClick={onToggleMode}
                    className="font-medium text-blue-600 hover:text-blue-800"
                >
                    {isLogin ? "Register account" : "Sign in instead"}
                </button>
            </div>
        </>
    );
}
