import { useEffect, useState } from "react";
import Toast from "./Toast";
import { toastStore, toast, type ToastMessage } from "./toastManager";

export default function ToastContainer() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        const unsubscribe = toastStore.subscribe(setToasts);
        return () => unsubscribe();
    }, []);

    return (
        <div className="fixed top-4 right-4 z-99 flex flex-col gap-3 pointer-events-none">
            {toasts.map((t) => (
                <div key={t.id} className="pointer-events-auto">
                    <Toast
                        type={t.type || "info"}
                        title={t.title}
                        message={t.message}
                        duration={t.duration}
                        onClose={() => toast.remove(t.id)}
                    />
                </div>
            ))}
        </div>
    );
}
