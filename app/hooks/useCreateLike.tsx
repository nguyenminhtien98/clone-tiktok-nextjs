import { useState } from "react";
import { database, ID } from "../libs/AppWriteClient";
import useCreateNotification from "./useCreateNotification";


const useCreateLike = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { createNotification } = useCreateNotification();

    const createLike = async (userId: string, postId: string, postOwnerId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await database.createDocument(
                String(process.env.NEXT_PUBLIC_DATABASE_ID),
                String(process.env.NEXT_PUBLIC_COLLECTION_ID_LIKE),
                ID.unique(),
                {
                    user_id: userId,
                    post_id: postId,
                    created_at: new Date().toISOString(),
                }
            );
            await createNotification({
                type: "like",
                fromUserId: userId,
                toUserId: postOwnerId,
                postId: postId,
            });
        } catch (err) {
            console.error("createLike error:", err);
            setError((err as Error).message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { createLike, isLoading, error };
};

export default useCreateLike;
