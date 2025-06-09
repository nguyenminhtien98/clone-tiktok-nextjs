import { useState, useCallback } from "react";
import { database, ID } from "../libs/AppWriteClient";
import useCreateNotification from "./useCreateNotification";

const useCreateComment = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const { createNotification } = useCreateNotification();

    const createComment = useCallback(
        async (
            userId: string,
            postId: string,
            comment: string,
            postOwnerId: string
        ) => {
            setLoading(true);
            setError(null);
            try {
                await database.createDocument(
                    String(process.env.NEXT_PUBLIC_DATABASE_ID),
                    String(process.env.NEXT_PUBLIC_COLLECTION_ID_COMMENT),
                    ID.unique(),
                    {
                        user_id: userId,
                        post_id: postId,
                        text: comment,
                        created_at: new Date().toISOString(),
                    }
                );
                await createNotification({
                    type: "comment",
                    fromUserId: userId,
                    toUserId: postOwnerId,
                    postId,
                    content: comment,
                });
            } catch (err) {
                console.error("createComment error:", err);
                setError(err as Error);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [createNotification]
    );

    return { createComment, loading, error };
};

export default useCreateComment;
