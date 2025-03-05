import { database, Query } from "../libs/AppWriteClient";

const getLikesByPostId = async (postId: string) => {
  if (!postId) {
    return [];
  }

  try {
    const response = await database.listDocuments(
      String(process.env.NEXT_PUBLIC_DATABASE_ID),
      String(process.env.NEXT_PUBLIC_COLLECTION_ID_LIKE),
      [Query.equal("post_id", postId)]
    );

    const documents = response.documents;
    const result = documents.map((doc) => ({
      id: doc?.$id,
      user_id: doc?.user_id,
      post_id: doc?.post_id,
    }));

    return result;
  } catch (error) {
    console.error("Failed to fetch likes:", error);
    throw error;
  }
};

export default getLikesByPostId;
