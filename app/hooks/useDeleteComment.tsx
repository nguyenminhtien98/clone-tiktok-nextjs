import { database } from "../libs/AppWriteClient";

const useDeleteComment = () => {
    const deleteComment = async (id: string) => {
        try {
            await database.deleteDocument(
                String(process.env.NEXT_PUBLIC_DATABASE_ID), 
                String(process.env.NEXT_PUBLIC_COLLECTION_ID_COMMENT), 
                id
            );
        } catch (error) {
            console.error("Failed to delete comment:", error);
            throw error;
        }
    };

    return { deleteComment };
};

export default useDeleteComment;
