import { useState, useCallback } from "react";
import { database, ID } from "../libs/AppWriteClient";

const useCreateComment = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createComment = useCallback(async (userId: string, postId: string, comment: string) => {
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
        } catch (error) {
            setError(error as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    return { createComment, loading, error };
}

export default useCreateComment;