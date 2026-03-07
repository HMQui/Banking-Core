import { useState } from "react";
import Toast, { type ToastType } from "./Toast";
import ConfirmationModal from "../components/ConfirmationModal";

export default function ComponentsPreview() {
    const [isModalOpen, setIsModalOpen] = useState(true);
    const [toasts, setToasts] = useState([
        {
            id: 1,
            type: "success" as ToastType,
            title: "Transaction Successful",
            message: "Your transfer of $450.00 to Account ...4921 has been completed.",
        },
        {
            id: 2,
            type: "error" as ToastType,
            title: "Payment Failed",
            message:
                "We couldn't process your request due to insufficient funds. Please check your balance.",
        },
        {
            id: 3,
            type: "info" as ToastType,
            title: "Scheduled Maintenance",
            message: "System maintenance is scheduled for tonight at 2:00 AM EST.",
        },
    ]);

    const removeToast = (id: number) => {
        setToasts(toasts.filter((toast) => toast.id !== id));
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Component Library</h1>
                    <p className="text-slate-500">Feedback Overlays & Modal Windows</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Toasts Preview Section */}
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-2">
                            Toast Notifications
                        </h2>
                        <p className="text-sm text-slate-500 mb-6">
                            Floating alerts that appear to provide immediate feedback on actions.
                        </p>
                        <div className="space-y-4">
                            {toasts.map((toast) => (
                                <Toast
                                    key={toast.id}
                                    type={toast.type}
                                    title={toast.title}
                                    message={toast.message}
                                    onClose={() => removeToast(toast.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Modal Preview Section */}
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-2">
                            Confirmation Modal
                        </h2>
                        <p className="text-sm text-slate-500 mb-6">
                            Critical action confirmation dialog requiring explicit user decision.
                        </p>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-medium hover:bg-blue-800"
                        >
                            Open Modal
                        </button>
                    </div>
                </div>
            </div>

            {/* Fixed Positioning Toast Container (How it would look in real app) */}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
                {/* Real toast rendering would go here */}
            </div>

            <ConfirmationModal
                isOpen={isModalOpen}
                title="Confirm International Transfer"
                message={
                    <>
                        Are you sure you want to transfer{" "}
                        <span className="font-bold text-slate-900">$2,450.00 USD</span> to{" "}
                        <span className="font-bold text-slate-900">GB82...2942</span>? This action
                        cannot be reversed once processed.
                    </>
                }
                confirmText="Confirm Transfer"
                cancelText="Cancel"
                onConfirm={() => setIsModalOpen(false)}
                onCancel={() => setIsModalOpen(false)}
            />
        </div>
    );
}
