import { database, Query } from "../libs/AppWriteClient";
import getProfileByUserId from "./getProfileByUserId";

export type NotificationType = "like" | "comment" | "follow";

export interface NotificationItem {
    id: string;
    type: NotificationType;
    fromUserId: string;
    toUserId: string;
    postId?: string;
    content?: string;
    created_at: string;
    fromProfile: {
        user_id: string;
        name: string;
        image: string | null;
    };
}

const getNotificationsByUser = async (
    userId: string
): Promise<NotificationItem[]> => {
    try {
        const response = await database.listDocuments(
            String(process.env.NEXT_PUBLIC_DATABASE_ID),
            String(process.env.NEXT_PUBLIC_COLLECTION_ID_NOTIFICATIONS),
            [
                Query.equal("toUserId", userId),
                Query.orderDesc("created_at"),
            ]
        );
        const docs = response.documents;

        const arr = await Promise.all(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            docs.map(async (doc: any) => {
                const profile = await getProfileByUserId(doc.fromUserId);
                return {
                    id: doc.$id,
                    type: doc.type as NotificationType,
                    fromUserId: doc.fromUserId,
                    toUserId: doc.toUserId,
                    postId: doc.postId,
                    content: doc.content,
                    created_at: doc.created_at,
                    fromProfile: {
                        user_id: profile?.user_id || "",
                        name: profile?.name || "Unknown",
                        image: profile?.image || null,
                    },
                };
            })
        );
        return arr;
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
        return [];
    }
};

export default getNotificationsByUser;
