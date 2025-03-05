"use client";

import { use } from "react";
import Comments from "../../../components/post/Comments";
import CommentsHeader from "@/app/components/post/CommentsHeader";
import Link from "next/link";
import { useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import { useRouter } from "next/navigation";
import ClientOnly from "@/app/components/ClientOnly";
import type { CommentWithProfile, Post, PostPageTypes } from "../../../types";
import { usePostStore } from "@/app/stores/post";
import { useLikeStore } from "@/app/stores/like";
import { useCommentStore } from "@/app/stores/comment";
import useCreateBucketUrl from "../../../hooks/useCreateBucketUrl";
import getCommentsByPostId from "../../../hooks/useGetCommentsByPostId";
import getProfileByUserId from "@/app/hooks/getProfileByUserId";

export default function Post({ params }: PostPageTypes) {
  const resolvedParams = use(params);
  const { postId, userId } = resolvedParams;

  const { postById, postsByUser, setPostById, setPostsByUser } = usePostStore();
  const { setLikesByPost } = useLikeStore();
  const { setCommentsByPost } = useCommentStore();
  const router = useRouter();

  const videoUrl = useCreateBucketUrl(postById?.video_id || "");

  useEffect(() => {
    setPostById(postId);
    setLikesByPost(postId);
    setPostsByUser(userId);

    const fetchComments = async () => {
      try {
        const comments = await getCommentsByPostId(postId);

        const mappedComments: CommentWithProfile[] = await Promise.all(
          comments.map(async (comment) => {
            let profile = null;

            try {
              profile = await getProfileByUserId(comment.user_id);
            } catch (profileError) {
              console.error("Lỗi khi lấy profile:", profileError);
            }

            return {
              id: comment?.id || crypto.randomUUID(),
              user_id: comment?.user_id || "",
              post_id: comment?.post_id || "",
              text: comment?.text || "",
              created_at: comment?.created_at || new Date().toISOString(),
              profile: profile || null,
            };
          })
        );

        setCommentsByPost(postId, mappedComments);
      } catch (error) {
        console.error("Lỗi khi lấy comment:", error);
      }
    };

    if (postId) {
      fetchComments();
    }
  }, [
    postId,
    userId,
    setPostById,
    setLikesByPost,
    setPostsByUser,
    setCommentsByPost,
  ]);

  const loopThroughPostsUp = () => {
    postsByUser.find((post) => {
      if (post.id > postId) {
        router.push(`/post/${post.id}/${userId}`);
      }
    });
  };

  const loopThroughPostsDown = () => {
    postsByUser.find((post) => {
      if (post.id < postId) {
        router.push(`/post/${post.id}/${userId}`);
      }
    });
  };

  return (
    <>
      <div
        id="PostPage"
        className="lg:flex justify-between w-full h-screen bg-black overflow-auto"
      >
        <div className="lg:w-[calc(100%-540px)] h-full relative">
          <Link
            href={`/profile/${userId}`}
            className="absolute text-white z-20 m-5 rounded-full bg-gray-700 p-1.5 hover:bg-gray-800"
          >
            <AiOutlineClose size="27" />
          </Link>

          <div>
            <button
              onClick={() => loopThroughPostsUp()}
              className="absolute z-20 right-4 top-4 flex items-center justify-center rounded-full bg-gray-700 p-1.5 hover:bg-gray-800"
            >
              <BiChevronUp size="30" color="#FFFFFF" />
            </button>

            <button
              onClick={() => loopThroughPostsDown()}
              className="absolute z-20 right-4 top-20 flex items-center justify-center rounded-full bg-gray-700 p-1.5 hover:bg-gray-800"
            >
              <BiChevronDown size="30" color="#FFFFFF" />
            </button>
          </div>

          <img
            className="absolute z-20 top-[18px] left-[70px] rounded-full lg:mx-0 mx-auto"
            width="45"
            src="/images/tiktok-logo-small.png"
          />

          <ClientOnly>
            {postById?.video_id ? (
              <video
                className="fixed object-cover w-full my-auto z-[0] h-screen"
                src={videoUrl}
              />
            ) : null}

            <div className="bg-black bg-opacity-70 lg:min-w-[480px] z-10 relative">
              {postById?.video_id ? (
                <video
                  autoPlay
                  controls
                  loop
                  muted
                  className="h-screen mx-auto"
                  src={videoUrl}
                />
              ) : null}
            </div>
          </ClientOnly>
        </div>

        <div
          id="InfoSection"
          className="lg:max-w-[550px] relative w-full h-full bg-white"
        >
          <div className="py-7" />

          <ClientOnly>
            {postById ? (
              <CommentsHeader post={postById} params={resolvedParams} />
            ) : null}
          </ClientOnly>
          <Comments params={resolvedParams} />
        </div>
      </div>
    </>
  );
}
