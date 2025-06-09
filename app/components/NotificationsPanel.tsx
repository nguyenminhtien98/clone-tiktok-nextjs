"use client";

import { useEffect, useState, useRef } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { useUser } from "../context/user";
import getNotificationsByUser, { NotificationItem } from "../hooks/getNotificationsByUser";
import { NotificationRow } from "./NotificationRow";
import Loading from "./Loading";

type FilterType = "all" | "like" | "comment" | "follow";

interface NotificationsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
    const router = useRouter();
    const { user, followUser, isFollowing } = useUser();
    const [notifications, setNotifications] = useState<
        (NotificationItem & { initialFollowed?: boolean })[]
    >([]);
    const [filter, setFilter] = useState<FilterType>("all");
    const [loading, setLoading] = useState(true);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        (async () => {
            setNotifications([]);
            setLoading(true);

            const arr = await getNotificationsByUser(user!.id);

            const withFollowed = await Promise.all(
                arr.map(async (n) => {
                    if (n.type === "follow") {
                        const followed = await isFollowing(n.fromUserId);
                        return { ...n, initialFollowed: followed };
                    }
                    return n;
                })
            );

            setNotifications(withFollowed);
            setLoading(false);
        })();
    }, [isOpen, user, isFollowing]);

    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (isOpen && panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose();
                setFilter("all");
            }
        }
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const filtered = notifications.filter(n => filter === "all" ? true : n.type === filter);

    return (
        <div
            ref={panelRef}
            className="absolute top-0 left-0 h-full w-full border-x border border-[rgba(0,0,0,0.12)] bg-white shadow-lg flex flex-col z-30 pt-[70px]"
        >
            <div className="flex items-center justify-between px-4 py-3 text-[24px] flex-shrink-0 bg-white">
                <h2 className="text-lg font-semibold">Thông báo</h2>
                <button onClick={() => (onClose(), setFilter("all"))} className="p-1 bg-gray-100 hover:bg-gray-200 rounded-full">
                    <AiOutlineClose size={20} />
                </button>
            </div>

            <div
                ref={panelRef}
                className="flex flex-wrap gap-2 pl-4 scrollbar-hide text-[14px] overflow-x-auto no-scrollbar bg-white cursor-grab"
            >
                {(["all", "like", "comment", "follow"] as FilterType[]).map(t => (
                    <button
                        key={t}
                        onClick={() => setFilter(t)}
                        className={`flex-shrink-0 px-[8px] rounded-[12px] font-semibold ${filter === t
                            ? "bg-black text-white"
                            : "bg-gray-100 text-black"
                            }`}
                    >
                        {t === "all"
                            ? "Tất cả hoạt động"
                            : t === "like"
                                ? "Thích"
                                : t === "comment"
                                    ? "Bình luận"
                                    : "Follower"}
                    </button>
                ))}
            </div>

            <div className="flex-1 pt-[10px] overflow-auto bg-white scrollbar-hide">
                {loading ? (
                    <Loading />
                ) : filtered.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">Không có thông báo</div>
                ) : (
                    filtered.map(item => (
                        <NotificationRow
                            key={item.id}
                            item={item}
                            followUser={followUser}
                            onNavigate={() => router.push(`/post/${item.postId}/${item.toUserId}`)}
                            initialFollowed={item.initialFollowed}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

