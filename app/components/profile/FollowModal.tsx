"use client";

import { useState, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { useUser } from "../../context/user";
import { FollowingUser } from "../../types";
import Loading from "../Loading";
import { database, Query } from "../../libs/AppWriteClient";
import getRandomUsers from "@/app/hooks/useGetRandomUsers";
import useCreateBucketUrl from "@/app/hooks/useCreateBucketUrl";

interface FollowModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    initialTab: "following" | "followers" | "suggested";
    followingCount: number;
    followersCount: number;
}

function Avatar({ image }: { image?: string | null }) {
    const defaultAvatarId = process.env.NEXT_PUBLIC_PLACEHOLDER_DEFAULT_IMAGE_ID || "67c2f8040021729661b7";
    const avatarUrl = useCreateBucketUrl(image || defaultAvatarId);
    return <img src={avatarUrl} className="w-8 h-8 rounded-full" alt="avatar" />;
}

export default function FollowModal({
    isOpen,
    onClose,
    userId,
    initialTab,
    followingCount,
    followersCount,
}: FollowModalProps) {
    const { getFollowingList } = useUser();
    const [tab, setTab] = useState(initialTab);
    const [list, setList] = useState<FollowingUser[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTab(initialTab);
            setList([]);
        }
    }, [isOpen, initialTab]);

    useEffect(() => {
        if (!isOpen) {
            setList([]);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        let isActive = true;
        setLoading(true);

        (async () => {
            if (tab === "following") {
                const following = await getFollowingList();
                if (isActive) {
                    setList(following);
                }
            } else if (tab === "followers") {
                const res = await database.listDocuments(
                    String(process.env.NEXT_PUBLIC_DATABASE_ID),
                    String(process.env.NEXT_PUBLIC_COLLECTION_ID_FOLLOWS),
                    [Query.equal("followingId", userId)]
                );
                const items = await Promise.all(
                    res.documents.map(async (doc) => {
                        const prof = await database.getDocument(
                            String(process.env.NEXT_PUBLIC_DATABASE_ID),
                            String(process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE),
                            doc.followerId
                        );
                        return { id: prof.user_id, name: prof.name, image: prof.image };
                    })
                );
                if (isActive) {
                    setList(items);
                }
            } else {
                const followed = await getFollowingList();
                const all = await getRandomUsers(userId, 20);
                if (isActive) {
                    setList(all.filter((u) => !followed.some((f) => f.id === u.id)));
                }
            }
            if (isActive) {
                setLoading(false);
            }
        })();

        return () => {
            isActive = false;
        };
    }, [isOpen, tab, userId, getFollowingList]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg w-full max-w-md p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold capitalize">
                        {tab === "following"
                            ? "Đã Follow"
                            : tab === "followers"
                                ? "Followers"
                                : "Đề xuất"}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <AiOutlineClose size={24} />
                    </button>
                </div>
                <div className="flex space-x-4 mb-4">
                    {[
                        { key: "following", label: `Đã Follow ${followingCount}` },
                        { key: "followers", label: `Followers ${followersCount}` },
                        { key: "suggested", label: "Đề xuất" },
                    ].map((item) => (
                        <button
                            key={item.key}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onClick={() => setTab(item.key as any)}
                            className={`pb-1 ${tab === item.key
                                ? "border-b-2 border-black font-semibold text-black"
                                : "text-gray-500"
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
                <div className="max-h-80 overflow-auto scrollbar-hide">
                    {loading ? (
                        <div className="flex justify-center items-center py-4">
                            <Loading style="h-100%" />
                        </div>
                    ) : (
                        list.map((u) => (
                            <div key={u.id} className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                    <Avatar image={u.image} />
                                    <span className="ml-3 font-semibold">{u.name}</span>
                                </div>
                                {tab === "following" ? (
                                    <button className="py-1 px-3 border border-gray-300 text-gray-600 rounded">
                                        Đang Follow
                                    </button>
                                ) : tab === "followers" ? (
                                    <button className="py-1 px-3 bg-[#F02C56] text-white rounded">
                                        Follow lại
                                    </button>
                                ) : (
                                    <button className="py-1 px-3 bg-[#F02C56] text-white rounded">
                                        Follow
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}