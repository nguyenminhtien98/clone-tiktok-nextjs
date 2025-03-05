import { database, Query } from "../libs/AppWriteClient";
import type { CommentWithProfile } from "../types"; // Import kiểu
import getProfileByUserId from "./getProfileByUserId";

const getCommentsByPostId = async (postId: string): Promise<CommentWithProfile[]> => {
  if (!postId) {
    console.warn("postId is undefined!");
    return [];
  }

  try {
    const commentsResult = await database.listDocuments(
      String(process.env.NEXT_PUBLIC_DATABASE_ID),
      String(process.env.NEXT_PUBLIC_COLLECTION_ID_COMMENT),
      [Query.equal("post_id", postId), Query.orderDesc("$id")]
    );

    if (!commentsResult?.documents || commentsResult.documents.length === 0) {
      return [];
    }

    const comments = await Promise.all(
      commentsResult.documents.map(async (comment) => {
        let profile = null;
        try {
          profile = await getProfileByUserId(comment.user_id);
        } catch (error) {
          console.error(`Failed to fetch profile for user ${comment.user_id}:`, error);
        }

        return {
          id: comment?.$id || crypto.randomUUID(),
          user_id: comment?.user_id ?? null,
          post_id: comment?.post_id ?? null,
          text: comment?.text || "",
          created_at: comment?.created_at || new Date().toISOString(),
          profile: profile || null,
        };
      })
    );

    return comments;
  } catch (err) {
    console.error("Failed to fetch comments:", err);
    throw err;
  }
};

export default getCommentsByPostId;