import { database } from "../libs/AppWriteClient";
import { Profile } from "../types";

const getProfileByUserId = async (userId: string): Promise<Profile | null> => {
  try {
    const response = await database.getDocument(
      String(process.env.NEXT_PUBLIC_DATABASE_ID),
      String(process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE),
      userId
    );
    return {
      id: response.$id,
      user_id: response.user_id,
      name: response.name,
      image: response.image,
      bio: response.bio,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default getProfileByUserId;