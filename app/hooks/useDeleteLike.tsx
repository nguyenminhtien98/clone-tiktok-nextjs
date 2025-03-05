import { useState } from "react";
import { database } from "../libs/AppWriteClient";

const useDeleteLike = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteLike = async (id: string) => {
    setIsDeleting(true);
    setError(null);

    try {
      await database.deleteDocument(
        String(process.env.NEXT_PUBLIC_DATABASE_ID),
        String(process.env.NEXT_PUBLIC_COLLECTION_ID_LIKE),
        id
      );
    } catch (error) {
      setError("Failed to delete like");
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteLike, isDeleting, error };
};

export default useDeleteLike;