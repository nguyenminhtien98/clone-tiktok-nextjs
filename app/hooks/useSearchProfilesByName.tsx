import { database, Query } from "../libs/AppWriteClient";

export const fetchProfilesByName = async (name: string): Promise<Profile[]> => {
  try {
    const response = await database.listDocuments(
      String(process.env.NEXT_PUBLIC_DATABASE_ID),
      String(process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE),
      [
        Query.search("name", name),
        Query.limit(10),
      ]
    );
    return response.documents.map((doc) => ({
      id: doc.$id,
      user_id: doc.user_id,
      name: doc.name,
      image: doc.image,
    }));
  } catch (error) {
    console.error("Error fetching profiles by name:", error);
    return [];
  }
};

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  image: string | null | undefined;
}