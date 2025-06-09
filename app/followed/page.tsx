"use client";

import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { useUser } from "../context/user";
import ClientOnly from "../components/ClientOnly";
import PostMain from "../components/PostMain";
import getPostsByUser from "../hooks/useGetProfileByUserId";
import Loading from "../components/Loading";
import { PostWithProfile } from "../types"

export default function FollowedPage() {
    const { user, getFollowingList } = useUser();
    const [followedPosts, setFollowedPosts] = useState<PostWithProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            if (!user) {
                setFollowedPosts([]);
                setLoading(false);
                return;
            }
            const list = await getFollowingList();
            const arr = await Promise.all(list.map(f => getPostsByUser(f.id)));
            const merged = arr.flat().sort((a, b) => b.created_at.localeCompare(a.created_at));
            setFollowedPosts(merged as PostWithProfile[]);
            setLoading(false);
        })();
    }, [user, getFollowingList]);

    return (
        <MainLayout>
            <div className="mt-[80px] ml-[90px] w-[calc(100%-90px)] max-w-[690px] ml-auto">
                <h2 className="text-2xl font-semibold mb-4">Đã follow</h2>
                {loading ? (
                    <Loading />
                ) : followedPosts.length === 0 ? (
                    <div className="text-center text-gray-500">
                        Bạn chưa follow ai hoặc họ chưa có post nào.
                    </div>
                ) : (
                    <ClientOnly>
                        {followedPosts.map((post, i) => (
                            <PostMain key={i} post={post} />
                        ))}
                    </ClientOnly>
                )}

            </div>
        </MainLayout>
    );
}
