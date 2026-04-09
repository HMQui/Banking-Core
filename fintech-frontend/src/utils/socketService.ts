import { io, Socket } from "socket.io-client";
import { createDPoPProof } from "./dpopService";

export interface NotificationPayload {
    type: "TRANSACTION_RECEIVED" | string;
    data: {
        receiverId: string | number;
        amount: number;
        currency: string;
        senderName: string;
        description: string;
        timestamp: string;
    };
}

class SocketService {
    private socket: Socket | null = null;

    connect(userId: string, token: string): void {
        if (this.socket?.connected) return;

        const BASE_URL =
            import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:3000";

        this.socket = io(BASE_URL, {
            auth: async (cb) => {
                try {
                    const socketUrl = `${BASE_URL}/socket.io/`;

                    const dpopProof = await createDPoPProof({
                        url: socketUrl,
                        method: "GET",
                        accessToken: token,
                    });

                    cb({ token, dpop: dpopProof });
                } catch (error) {
                    console.error("Failed to generate DPoP proof for WebSocket:", error);
                    cb({ token });
                }
            },
            query: { userId },
            transports: ["websocket"],
        });

        this.socket.on("connect", () => {
            console.log("Connected to Notification WebSocket");
        });

        this.socket.on("disconnect", (reason) => {
            console.log("Disconnected from WebSocket:", reason);
        });
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    onNotification(callback: (payload: NotificationPayload) => void): void {
        if (!this.socket) return;
        this.socket.on("notification", callback);
    }

    offNotification(): void {
        if (!this.socket) return;
        this.socket.off("notification");
    }
}

export const socketService = new SocketService();
