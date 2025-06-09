// components/NotificationRow.tsx
"use client";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { NotificationItem } from "../hooks/getNotificationsByUser";
import useCreateBucketUrl from "../hooks/useCreateBucketUrl";

interface Props {
    item: NotificationItem & { initialFollowed?: boolean };
    followUser(id: string): Promise<void>;
    onNavigate(): void;
}

export function NotificationRow({
    item, followUser, onNavigate
}: Props) {
    const { fromProfile, type, content, created_at, initialFollowed } = item;
    const [userFollowed, setUserFollowed] = useState(!!initialFollowed);
    const [loadingFollow, setLoadingFollow] = useState(false);
    const avatar = useCreateBucketUrl(fromProfile.image);

    const handleFollowAgain = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setLoadingFollow(true);
        await followUser(fromProfile.user_id);
        setUserFollowed(true);
        setLoadingFollow(false);
    };

    return (
        <div
            onClick={type !== "follow" ? onNavigate : undefined}
            className={`flex items-center justify-between px-4 py-3 hover:bg-gray-100 ${type !== "follow" ? "cursor-pointer" : ""
                }`}
        >
            <img src={avatar} className="w-10 h-10 rounded-full" />
            <div className="ml-3 flex-1">
                <p className="text-[14px]">
                    {type === "follow" && (
                        <span>
                            <span className="font-semibold">{fromProfile.name}</span> đã follow bạn
                        </span>
                    )}
                    {type === "like" && (
                        <><span className="font-semibold">{fromProfile.name}</span> đã thích video của bạn</>
                    )}
                    {type === "comment" && (
                        <><span className="font-semibold">{fromProfile.name}</span> đã bình luận: “{content}”</>
                    )}
                </p>
                <p className="text-[12px] text-gray-500">
                    {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
                </p>
            </div>
            {type === "follow" && (
                <button
                    onClick={handleFollowAgain}
                    disabled={loadingFollow || userFollowed}
                    className={`ml-3 px-3 py-1 text-sm font-semibold rounded-md whitespace-nowrap transition-colors ${userFollowed
                            ? "border-[#F02C56] text-[#F02C56] cursor-default"
                            : "bg-[#F02C56] text-white hover:bg-[#e0234f]"
                        }`}
                >
                    {loadingFollow ? "…" : userFollowed ? "Đang Follow" : "Follow lại"}
                </button>
            )}
        </div>
    );
}
