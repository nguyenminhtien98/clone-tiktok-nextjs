import { database, Query } from "../libs/AppWriteClient";
import { PostWithProfile } from "../types";

const getAllPosts = async (): Promise<PostWithProfile[]> => {
  try {
    const collectionId = String(process.env.NEXT_PUBLIC_COLLECTION_ID_POST);

    if (!collectionId) {
      throw new Error("Posts collection ID is not defined in environment variables");
    }

    const response = await database.listDocuments(
      String(process.env.NEXT_PUBLIC_DATABASE_ID),
      collectionId,
      [Query.orderDesc("$createdAt")]
    );

    const postsWithProfile = await Promise.all(
      response.documents.map(async (doc) => {
        try {
          const profileResponse = await database.getDocument(
            String(process.env.NEXT_PUBLIC_DATABASE_ID),
            String(process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE),
            doc.user_id
          );

          return {
            id: doc.$id,
            user_id: doc.user_id,
            video_id: doc.video_id,
            text: doc.text,
            created_at: doc.$createdAt,
            profile: {
              user_id: profileResponse.user_id || "",
              name: profileResponse.name || "Unknown User",
              image: profileResponse.image || null,
            },
          };
        } catch (error) {
          console.error(`Error fetching profile for user_id ${doc.user_id}:`, error);
          return {
            id: doc.$id,
            user_id: doc.user_id,
            video_id: doc.video_id,
            text: doc.text,
            created_at: doc.$createdAt,
            profile: {
              user_id: doc.user_id || "",
              name: "Unknown User",
              image: null,
            },
          };
        }
      })
    );

    return postsWithProfile;
  } catch (error) {
    console.error("Error fetching all posts:", error);
    return [];
  }
};

export default getAllPosts;