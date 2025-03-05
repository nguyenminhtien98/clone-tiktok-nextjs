import { database, Query } from "../libs/AppWriteClient";
import getProfileByUserId from "./getProfileByUserId";

const getPostsByUser = async (userId: string) => {
  try {
    const response = await database.listDocuments(
      String(process.env.NEXT_PUBLIC_DATABASE_ID),
      String(process.env.NEXT_PUBLIC_COLLECTION_ID_POST),
      [Query.equal("user_id", userId), Query.orderDesc("$id")]
    );

    const documents = response.documents;

    const result = await Promise.all(
      documents.map(async (doc) => {
        const profile = await getProfileByUserId(doc?.user_id);

        return {
          id: doc?.$id,
          user_id: doc?.user_id,
          video_id: doc?.video_id,
          text: doc?.text,
          created_at: doc?.created_at,
          profile: profile,
        };
      })
    );

    return result;
  } catch (error) {
    console.error("Error fetching posts by user:", error);
    throw error;
  }
};

export default getPostsByUser;
