import { useState } from "react";
import { database, ID } from "../libs/AppWriteClient";

const useCreateLike = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createLike = async (userId: string, postId: string) => {
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
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return { createLike, isLoading, error };
};

export default useCreateLike;