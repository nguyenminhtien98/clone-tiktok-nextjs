import { useMemo } from "react";
import { Like } from "../types";

const useIsLiked = (userId: string, postId: string, likes: Array<Like>): boolean => {
  const isLiked = useMemo(() => {
    if (!userId || !postId || !likes) return false;

    return likes.some((like) => like.user_id === userId && like.post_id === postId);
  }, [userId, postId, likes]);

  return isLiked;
};

export default useIsLiked;