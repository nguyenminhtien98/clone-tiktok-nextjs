import { database } from "../libs/AppWriteClient";
import { PostWithProfile } from "../types";

const getPostById = async (postId: string): Promise<PostWithProfile | null> => {
  try {
    const response = await database.getDocument(
      String(process.env.NEXT_PUBLIC_DATABASE_ID),
      String(process.env.NEXT_PUBLIC_COLLECTION_ID_POST),
      postId
    );

    const profileResponse = await database.getDocument(
      String(process.env.NEXT_PUBLIC_DATABASE_ID),
      String(process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE),
      response.user_id
    );

    return {
      id: response.$id,
      user_id: response.user_id,
      video_id: response.video_id,
      text: response.text,
      created_at: response.$createdAt,
      profile: {
        user_id: profileResponse.user_id || "",
        name: profileResponse.name || "Unknown User",
        image: profileResponse.image || null,
      },
    };
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    return null;
  }
};

export default getPostById;