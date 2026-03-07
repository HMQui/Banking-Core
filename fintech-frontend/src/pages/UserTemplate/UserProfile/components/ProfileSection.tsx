import { useState, useEffect } from "react";
import type { UserProfile } from "../../../../types/user";
import { toast } from "../../../../components/common/Toast/toastManager";
import { userService } from "../../../../api/userService";

interface ProfileSectionProps {
    user: UserProfile;
    onUpdateSuccess: (updatedUser: UserProfile) => void;
}

export default function ProfileSection({ user, onUpdateSuccess }: ProfileSectionProps) {
    const [fullName, setFullName] = useState(user.fullName);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setFullName(user.fullName);
    }, [user]);

    const initials = user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    const handleSave = async () => {
        if (!fullName.trim()) {
            setError("Full name is required.");
            return;
        }
        if (fullName.length < 2 || fullName.length > 100) {
            setError("Full name must be between 2 and 100 characters.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const updatedUser = await userService.updateProfile({ fullName });
            toast.success(
                "Profile Updated",
                "Your profile information has been saved successfully.",
            );
            onUpdateSuccess(updatedUser);
        } catch (err) {
            console.error(err);
            toast.error("Update Failed", "Could not update profile.");
            setError("An error occurred while saving your profile.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
            <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold text-lg">
                    {initials}
                </div>
                <div className="ml-4 flex flex-col justify-center">
                    <div className="flex items-center mb-1">
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {user.status || "ACTIVE"}
                        </span>
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 uppercase tracking-wider">
                            {user.role || "USER"}
                        </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Account Level: Standard
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Full Name
                    </label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => {
                            setFullName(e.target.value);
                            setError("");
                        }}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-sm text-slate-800"
                        placeholder="e.g. Alex Johnson"
                    />
                    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed text-sm"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                        Email cannot be changed by the user.
                    </p>
                </div>
            </div>

            <div className="flex justify-end mt-6">
                <button
                    onClick={handleSave}
                    disabled={isLoading || fullName === user.fullName}
                    className="bg-white hover:bg-slate-50 text-slate-800 px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Saving..." : "Save Profile Changes"}
                </button>
            </div>
        </div>
    );
}
