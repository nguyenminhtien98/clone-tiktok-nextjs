import { database, Query } from "../libs/AppWriteClient";

const getRandomUsers = async (currentUserId: string | null = null, limit: number = 5) => {
  try {
    const profileResult = await database.listDocuments(
      String(process.env.NEXT_PUBLIC_DATABASE_ID),
      String(process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE),
      [Query.limit(100)]
    );

    const documents = profileResult.documents;

    const filteredProfiles = currentUserId
      ? documents.filter((profile) => profile.user_id !== currentUserId)
      : documents;
    const shuffled = filteredProfiles.sort(() => 0.5 - Math.random());
    const randomProfiles = shuffled.slice(0, limit);

    const result = randomProfiles.map((profile) => ({
      id: profile.user_id,
      name: profile.name,
      image: profile.image,
    }));

    return result;
  } catch (error) {
    console.log("Failed to fetch random users:", error);
    return [];
  }
};

export default getRandomUsers;