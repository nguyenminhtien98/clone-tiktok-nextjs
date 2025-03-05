import { useState } from "react";
import { database, storage } from "../libs/AppWriteClient";
import getLikesByPostId from "./useGetLikesByPostId";
import getCommentsByPostId from "./useGetCommentsByPostId";
import useDeleteLike from "./useDeleteLike";
import useDeleteComment from "./useDeleteComment";

const useDeletePostById = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { deleteLike } = useDeleteLike();
  const { deleteComment } = useDeleteComment();

  const deletePostById = async (postId: string, currentImage: string) => {
    setIsDeleting(true);
    setError(null);

    try {
      const likes = await getLikesByPostId(postId);
      const comments = await getCommentsByPostId(postId);

      await Promise.all([
        ...likes.map((like) => deleteLike(like?.id)),
        ...comments.map((comment) => deleteComment(comment?.id)),
      ]);

      await database.deleteDocument(
        String(process.env.NEXT_PUBLIC_DATABASE_ID),
        String(process.env.NEXT_PUBLIC_COLLECTION_ID_POST),
        postId
      );

      if (
        currentImage !==
        String(process.env.NEXT_PUBLIC_PLACEHOLDER_DEFAULT_IMAGE_ID)
      ) {
        await storage.deleteFile(
          String(process.env.NEXT_PUBLIC_BUCKET_ID),
          currentImage
        );
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
      setError("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  return { deletePostById, isDeleting, error };
};

export default useDeletePostById;
