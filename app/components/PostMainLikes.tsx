"use client";

import { AiFillHeart } from "react-icons/ai";
import { FaShare, FaCommentDots } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useUser } from "../context/user";
import { BiLoaderCircle } from "react-icons/bi";
import { useGeneralStore } from "../stores/general";
import { useRouter } from "next/navigation";
import { Comment, Like, PostMainLikesCompTypes } from "../types";
import useIsLiked from "../hooks/useIsLiked";
import useCreateLike from "../hooks/useCreateLike";
import useDeleteLike from "../hooks/useDeleteLike";
import getLikesByPostId from "../hooks/useGetLikesByPostId";
import getCommentsByPostId from "../hooks/useGetCommentsByPostId";

export default function PostMainLikes({ post }: PostMainLikesCompTypes) {
  const { setIsLoginOpen } = useGeneralStore();
  const router = useRouter();
  const contextUser = useUser();
  const [hasClickedLike, setHasClickedLike] = useState<boolean>(false);
  const [userLiked, setUserLiked] = useState<boolean>(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const userId = contextUser?.user?.id || "";
  const postId = post?.id || "";
  const isLiked = useIsLiked(userId, postId, likes);
  const { createLike } = useCreateLike();
  const { deleteLike } = useDeleteLike();

  useEffect(() => {
    hasUserLikedPost();
  }, [likes, contextUser]);

  useEffect(() => {
    const fetchComments = async () => {
      if (post?.id) {
        try {
          const fetchedComments = await getCommentsByPostId(post.id);
          setComments(fetchedComments || []);
        } catch (error) {
          console.error("Failed to fetch comments in PostMainLikes:", error);
          setComments([]);
        }
      }
    };

    fetchComments();
  }, [post?.id]);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const result = await getLikesByPostId(post?.id);
        setLikes(result);
      } catch (error) {
        console.error(error);
      }
    };

    if (post?.id) fetchLikes();
  }, [post?.id]);

  const hasUserLikedPost = () => {
    if (!contextUser) return;

    if (likes?.length < 1 || !contextUser?.user?.id) {
      setUserLiked(false);
      return;
    }

    setUserLiked(isLiked);
  };

  useEffect(() => {
    if (contextUser?.user?.id && post?.id) {
      setUserLiked(isLiked);
    }
  }, [isLiked, contextUser?.user?.id, post?.id]);

  const getAllLikesByPost = async () => {
    try {
      if (!post?.id) {
        console.warn("Post ID is undefined!");
        return;
      }

      const result = await getLikesByPostId(post?.id);
      setLikes(result);
    } catch (err) {
      console.error(err);
    }
  };

  const like = async () => {
    setHasClickedLike(true);
    try {
      await createLike(contextUser?.user?.id || "", post?.id);
      await getAllLikesByPost();
      hasUserLikedPost();
    } catch (err) {
      console.error(err);
    } finally {
      setHasClickedLike(false);
    }
  };

  const unlike = async (id: string) => {
    setHasClickedLike(true);
    try {
      await deleteLike(id);
      await getAllLikesByPost();
      hasUserLikedPost();
    } catch (err) {
      console.error( err);
    } finally {
      setHasClickedLike(false);
    }
  };

  const likeOrUnlike = () => {
    if (!contextUser?.user?.id) {
      setIsLoginOpen(true);
      return;
    }

    if (!isLiked) {
      like();
    } else {
      likes.forEach((like: Like) => {
        if (
          contextUser?.user?.id === like?.user_id &&
          like?.post_id === post?.id
        ) {
          unlike(like?.id);
        }
      });
    }
  };

  return (
    <div id={`PostMainLikes-${post?.id}`} className="relative mr-[75px]">
      <div className="absolute bottom-0 pl-2">
        <div className="pb-4 text-center">
          <button
            disabled={hasClickedLike}
            onClick={() => likeOrUnlike()}
            className="rounded-full bg-gray-200 p-2 cursor-pointer"
          >
            {!hasClickedLike ? (
              <AiFillHeart
                color={likes?.length > 0 && userLiked ? "#ff2626" : ""}
                size="25"
              />
            ) : (
              <BiLoaderCircle className="animate-spin" size="25" />
            )}
          </button>
          <span className="text-xs text-gray-800 font-semibold">
            {likes?.length}
          </span>
        </div>

        <button
          onClick={() =>
            router.push(`/post/${post?.id}/${post?.profile?.user_id}`)
          }
          className="pb-4 text-center"
        >
          <div className="rounded-full bg-gray-200 p-2 cursor-pointer">
            <FaCommentDots size="25" />
          </div>
          <span className="text-xs text-gray-800 font-semibold">
            {comments.length}
          </span>
        </button>

        <button className="text-center">
          <div className="rounded-full bg-gray-200 p-2 cursor-pointer">
            <FaShare size="25" />
          </div>
          <span className="text-xs text-gray-800 font-semibold">55</span>
        </button>
      </div>
    </div>
  );
}
