import { useState, useEffect } from "react";
import ProfileSection from "./components/ProfileSection";
import ChangePasswordSection from "./components/ChangePasswordSection";
import type { UserProfile } from "../../../types/user";
import { userService } from "../../../api/userService";
import Loading from "../../../components/common/Loading";
import { useAppDispatch } from "../../../hooks/redux";
import { setUserGlobal } from "../../../store/slices/authSlice";

export default function UserProfilePage() {
    const dispatch = useAppDispatch();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await userService.getProfile();
                setUser(data);
            } catch (error) {
                console.error("Failed to fetch user profile:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (isLoading) {
        return <Loading />;
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
                <p className="text-slate-500">Failed to load profile data.</p>
            </div>
        );
    }

    const handleProfileUpdate = (updatedUser: UserProfile) => {
        setUser(updatedUser);
        dispatch(setUserGlobal(updatedUser));
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">User Profile & Security</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Manage your account information and security settings.
                    </p>
                </div>

                <ProfileSection user={user} onUpdateSuccess={handleProfileUpdate} />

                <ChangePasswordSection email={user.email} />
            </div>
        </div>
    );
}
