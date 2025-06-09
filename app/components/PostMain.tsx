"use client";

import { useEffect, useState } from "react";
import { PostMainCompTypes } from "../types";
import Link from "next/link";
import { ImMusic } from "react-icons/im";
import { AiFillHeart } from "react-icons/ai";
import useCreateBucketUrl from "../hooks/useCreateBucketUrl";
import PostMainLikes from "./PostMainLikes";
import { useUser } from "../context/user";
import { useGeneralStore } from "../stores/general";

export default function PostMain({ post }: PostMainCompTypes) {
  const context = useUser();
  const user = context.user;
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const videoUrl = useCreateBucketUrl(post?.video_id);
  const profileImageUrl = useCreateBucketUrl(post?.profile?.image);
  const { setIsLoginOpen } = useGeneralStore();

  useEffect(() => {
    const video = document.getElementById(
      `video-${post?.id}`
    ) as HTMLVideoElement;
    const postMainElement = document.getElementById(`PostMain-${post?.id}`);

    if (video && postMainElement && videoUrl) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            video.play();
          } else {
            video.pause();
          }
        },
        { threshold: [0.6] }
      );

      observer.observe(postMainElement);

      return () => observer.disconnect();
    }
  }, [post?.id, videoUrl]);

  useEffect(() => {
    if (context.user) {
      checkFollowStatus();
    }
  }, [context.user]);

  useEffect(() => {
    checkFollowStatus();
  }, [post.profile.user_id]);

  const checkFollowStatus = async () => {
    if (user && user.id !== post.profile.user_id && context.isFollowing) {
      const following = await context.isFollowing(post.profile.user_id);
      setIsFollowingUser(following);
    } else {
      setIsFollowingUser(false);
    }
  };

  const handleFollowToggle = async () => {

    if (!context.user) {
      setIsLoginOpen(true)
      return
    }

    if (context?.user.id === post.profile?.user_id) return;
    try {
      if (isFollowingUser) {
        await context.unfollowUser(post.profile.user_id);
      } else {
        await context.followUser(post.profile.user_id);
      }
      setIsFollowingUser(!isFollowingUser);
    } catch (error) {
      console.error("Follow toggle error:", error);
    }
  };

  useEffect(() => {
    function onFollowed(e: CustomEvent) {
      if (e.detail.userId === post.profile.user_id) {
        checkFollowStatus();
      }
    }
    window.addEventListener("user-followed", onFollowed as EventListener);
    return () => window.removeEventListener("user-followed", onFollowed as EventListener);
  }, [post.profile.user_id]);

  return (
    <div id={`PostMain-${post.id}`} className="flex border-b py-6">
      <div className="cursor-pointer">
        <img
          className="rounded-full max-h-[60px]"
          width="60"
          src={profileImageUrl || ""}
        />
      </div>

      <div className="pl-3 w-full px-4">
        <div className="flex items-center justify-between pb-0.5">
          <Link href={`/profile/${post.profile.user_id}`}>
            <span className="font-bold hover:underline cursor-pointer">
              {post.profile.name}
            </span>
          </Link>
          {(!user || user.id !== post.profile?.user_id) && (
            <button
              onClick={handleFollowToggle}
              className={`border text-[15px] px-[21px] py-0.5 border-[#F02C56] ${!isFollowingUser
                ? "bg-[#F02C56] text-white"
                : "text-[#F02C56] hover:bg-[#ffeef2]"
                }  font-semibold rounded-md`}
            >
              {isFollowingUser ? "Đang Follow" : "Follow"}
            </button>
          )}
        </div>
        <p className="text-[15px] pb-0.5 break-words md:max-w-[400px] max-w-[300px]">
          {post.text}
        </p>
        <p className="text-[14px] text-gray-500 pb-0.5">
          #fun #cool #SuperAwesome
        </p>
        <p className="text-[14px] pb-0.5 flex items-center font-semibold">
          <ImMusic size="17" />
          <span className="px-1">original sound - AWESOME</span>
          <AiFillHeart size="20" />
        </p>

        <div className="mt-2.5 flex">
          <div className="relative min-h-[480px] max-h-[580px] max-w-[260px] flex items-center bg-black rounded-xl cursor-pointer">
            {videoUrl ? (
              <video
                id={`video-${post.id}`}
                loop
                controls
                muted
                className="rounded-xl object-cover mx-auto h-full"
                src={videoUrl}
              />
            ) : (
              <p className="text-white">Video not available</p>
            )}
            <img
              className="absolute right-2 bottom-10"
              width="90"
              src="/images/tiktok-logo-white.png"
            />
          </div>
          <PostMainLikes post={post} />
        </div>
      </div>
    </div>
  );
}
