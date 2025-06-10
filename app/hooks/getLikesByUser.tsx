import { database, Query } from "../libs/AppWriteClient";
import getPostById from "./useGetPostById";
import type { PostWithProfile } from "../types";

export default async function getLikesByUser(
    userId: string
): Promise<PostWithProfile[]> {
    try {
        const response = await database.listDocuments(
            String(process.env.NEXT_PUBLIC_DATABASE_ID),
            String(process.env.NEXT_PUBLIC_COLLECTION_ID_LIKE),
            [Query.equal("user_id", userId)]
        );

        const likes = response.documents;
        const posts = await Promise.all(
            likes.map(async (like) => {
                const post = await getPostById(like.post_id);
                return post;
            })
        );

        return (
            posts.filter((p): p is PostWithProfile => p !== null)
                .sort((a, b) => (b.created_at > a.created_at ? 1 : -1))
        );
    } catch (error) {
        console.error("getLikesByUser error:", error);
        return [];
    }
}
