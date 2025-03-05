import { useUser } from "../context/user";
import { database, Query } from "../libs/AppWriteClient";

const useVideoViews = () => {
  const { user } = useUser();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const incrementView = async (videoId: string, userId?: string) => {
    if (!user || !user.id) {
      return;
    }
    try {
      const response = await database.createDocument(
        String(process.env.NEXT_PUBLIC_DATABASE_ID),
        String(process.env.NEXT_PUBLIC_COLLECTION_ID_VIDEO_VIEWS),
        "unique()",
        {
          videoId: videoId,
          userId: user.id,
          viewCount: 1,
        }
      );
      console.log(`View recorded for video ${videoId}:`, response);
    } catch (error) {
      console.error("Error incrementing view:", error);
      throw error;
    }
  };

  const getViewCount = async (videoId: string) => {
    try {
      const response = await database.listDocuments(
        String(process.env.NEXT_PUBLIC_DATABASE_ID),
        String(process.env.NEXT_PUBLIC_COLLECTION_ID_VIDEO_VIEWS),
        [Query.equal("videoId", videoId)]
      );
      return response.total;
    } catch (error) {
      console.error("Error fetching view count:", error);
      return 0;
    }
  };

  return { incrementView, getViewCount };
};

export default useVideoViews;