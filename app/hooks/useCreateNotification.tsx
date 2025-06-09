import { database, ID } from "../libs/AppWriteClient";

export type NotificationType = "like" | "comment" | "follow";

interface CreateNotificationPayload {
    type: NotificationType;
    fromUserId: string;
    toUserId: string;
    postId?: string;
    content?: string;
}

const useCreateNotification = () => {
    const createNotification = async (payload: CreateNotificationPayload) => {
        const { type, fromUserId, toUserId, postId = "", content = "" } = payload;
        try {
            await database.createDocument(
                String(process.env.NEXT_PUBLIC_DATABASE_ID),
                String(process.env.NEXT_PUBLIC_COLLECTION_ID_NOTIFICATIONS),
                ID.unique(),
                {
                    type,
                    fromUserId,
                    toUserId,
                    postId,
                    content,
                    created_at: new Date().toISOString(),
                }
            );
        } catch (error) {
            console.error("Failed to create notification:", error);
            throw error;
        }
    };

    return { createNotification };
};

export default useCreateNotification;
