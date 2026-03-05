import { type ToastType } from "./Toast";

export interface ToastMessage {
    id: string;
    type: ToastType;
    title: string;
    message: string;
    duration?: number;
}

type Listener = (toasts: ToastMessage[]) => void;
let listeners: Listener[] = [];
let toasts: ToastMessage[] = [];

const emitChange = () => {
    listeners.forEach((listener) => listener(toasts));
};

export const toastStore = {
    subscribe: (listener: Listener) => {
        listeners.push(listener);
        return () => {
            listeners = listeners.filter((l) => l !== listener);
        };
    },
    getSnapshot: () => toasts,
};

export const toast = {
    show: (type: ToastType, title: string, message: string, duration: number = 3000) => {
        const id = Math.random().toString(36).substring(2, 9);
        toasts = [...toasts, { id, type, title, message, duration }];
        emitChange();
    },
    success: (title: string, message: string, duration?: number) =>
        toast.show("success", title, message, duration),
    error: (title: string, message: string, duration?: number) =>
        toast.show("error", title, message, duration),
    info: (title: string, message: string, duration?: number) =>
        toast.show("info", title, message, duration),
    remove: (id: string) => {
        toasts = toasts.filter((t) => t.id !== id);
        emitChange();
    },
};
