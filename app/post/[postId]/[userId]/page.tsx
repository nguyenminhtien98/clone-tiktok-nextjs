"use client";

import { use, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { AiOutlineClose } from "react-icons/ai";
import { BiChevronUp, BiChevronDown } from "react-icons/bi";
import ClientOnly from "@/app/components/ClientOnly";
import Loading from "@/app/components/Loading";
import CommentsHeader from "@/app/components/post/CommentsHeader";
import Comments from "@/app/components/post/Comments";
import { usePostStore } from "@/app/stores/post";
import { useLikeStore } from "@/app/stores/like";
import { useCommentStore } from "@/app/stores/comment";
import useCreateBucketUrl from "@/app/hooks/useCreateBucketUrl";
import getCommentsByPostId from "@/app/hooks/useGetCommentsByPostId";
import getProfileByUserId from "@/app/hooks/getProfileByUserId";
import type { CommentWithProfile, PostPageTypes } from "@/app/types";

export default function PostPage({ params }: PostPageTypes) {
  const { postId: initPostId, userId } = use(params);

  const { postsByUser, setPostsByUser, postById, setPostById } = usePostStore();
  const { setLikesByPost } = useLikeStore();
  const { setCommentsByPost } = useCommentStore();

  const [currentPostId, setCurrentPostId] = useState(initPostId);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingNext, setLoadingNext] = useState(false);
  const firstLoad = useRef(true);

  const videoUrl = useCreateBucketUrl(postById?.video_id || "");

  useEffect(() => {
    setPostsByUser(userId);
  }, [userId, setPostsByUser]);

  useEffect(() => {
    const fetchAll = async (id: string) => {
      if (!firstLoad.current) {
        setLoadingNext(true);
      }
      await setPostById(id);
      await setLikesByPost(id);

      const raw = await getCommentsByPostId(id);
      const mapped: CommentWithProfile[] = await Promise.all(
        raw.map(async (c) => ({
          id: c.id,
          user_id: c.user_id,
          post_id: c.post_id,
          text: c.text,
          created_at: c.created_at,
          profile: (await getProfileByUserId(c.user_id)) || null,
        }))
      );
      setCommentsByPost(id, mapped);

      if (firstLoad.current) {
        setInitialLoading(false);
        firstLoad.current = false;
      }
      setLoadingNext(false);
    };

    fetchAll(currentPostId);
  }, [
    currentPostId,
    userId,
    setPostById,
    setLikesByPost,
    setCommentsByPost,
  ]);

  const idx = postsByUser.findIndex((p) => p.id === currentPostId);
  const prev = () => {
    if (idx > 0) setCurrentPostId(postsByUser[idx - 1].id);
  };
  const next = () => {
    if (idx < postsByUser.length - 1)
      setCurrentPostId(postsByUser[idx + 1].id);
  };

  const onWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) next();
    else if (e.deltaY > 0) prev();
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div className="lg:flex w-full h-screen bg-black overflow-hidden">
      <div className="lg:w-[calc(100%-540px)] h-full relative" onWheel={onWheel}>
        <Link
          href={`/profile/${userId}`}
          className="absolute z-20 m-5 p-1.5 bg-gray-700 rounded-full hover:bg-gray-800 text-white"
        >
          <AiOutlineClose size={27} />
        </Link>

        <button
          onClick={next}
          className="absolute z-20 right-4 top-4 p-1.5 bg-gray-700 rounded-full hover:bg-gray-800"
        >
          <BiChevronUp size={30} color="#fff" />
        </button>
        <button
          onClick={prev}
          className="absolute z-20 right-4 top-20 p-1.5 bg-gray-700 rounded-full hover:bg-gray-800"
        >
          <BiChevronDown size={30} color="#fff" />
        </button>

        <img
          src="/images/tiktok-logo-small.png"
          width={45}
          className="absolute z-20 top-4 left-16 rounded-full"
        />

        <ClientOnly>
          {postById?.video_id && (
            <video
              className="fixed object-cover w-full h-screen z-0"
              src={videoUrl}
            />
          )}
          <div className="relative z-10 bg-black bg-opacity-70 lg:min-w-[480px]">
            {postById?.video_id && (
              <video
                autoPlay
                controls
                loop
                muted
                className="h-screen mx-auto"
                src={videoUrl}
              />
            )}
          </div>
        </ClientOnly>

        {loadingNext && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black bg-opacity-75">
            <Loading />
          </div>
        )}
      </div>

      <div className="w-full lg:max-w-[550px] h-full bg-white relative">
        <div className="py-7" />
        <ClientOnly>
          {postById && (
            <CommentsHeader post={postById} params={{ postId: currentPostId, userId }} />
          )}
          <Comments params={{ postId: currentPostId, userId }} />
        </ClientOnly>
      </div>
    </div>
  );
}
