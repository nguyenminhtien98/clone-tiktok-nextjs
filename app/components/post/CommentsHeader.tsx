"use client";

import Link from "next/link";
import { AiFillHeart } from "react-icons/ai";
import { BsChatDots, BsTrash3 } from "react-icons/bs";
import { ImMusic } from "react-icons/im";
import moment from "moment";
import { useUser } from "../../context/user";
import { useEffect, useState } from "react";
import { BiLoaderCircle } from "react-icons/bi";
import ClientOnly from "../ClientOnly";
import useCreateBucketUrl from "../../hooks/useCreateBucketUrl";
import { useLikeStore } from "../../stores/like";
import { useCommentStore } from "../../stores/comment";
import { useGeneralStore } from "../../stores/general";
import { useRouter } from "next/navigation";
import useIsLiked from "../../hooks/useIsLiked";
import useCreateLike from "../../hooks/useCreateLike";
import useDeleteLike from "../../hooks/useDeleteLike";
import useDeletePostById from "../../hooks/useDeletePostById";
import { CommentsHeaderCompTypes } from "../../types";
import getCommentsByPostId from "../../hooks/useGetCommentsByPostId";

export default function CommentsHeader({
  post,
  params,
}: CommentsHeaderCompTypes) {
  const { setLikesByPost, likesByPost } = useLikeStore();
  const { commentsByPost, setCommentsByPost } = useCommentStore();
  const { setIsLoginOpen } = useGeneralStore();
  const { createLike } = useCreateLike();
  const { deleteLike } = useDeleteLike();
  const { deletePostById } = useDeletePostById();
  const imageUrl = useCreateBucketUrl(post?.profile?.image || "");

  const contextUser = useUser();
  const router = useRouter();
  const [hasClickedLike, setHasClickedLike] = useState<boolean>(false);
  const [isDeleteing, setIsDeleteing] = useState<boolean>(false);
  const [userLiked, setUserLiked] = useState<boolean>(false);
  const isLiked = useIsLiked(
    contextUser?.user?.id || "",
    params?.postId,
    likesByPost
  );

  useEffect(() => {
    const fetchData = async () => {
      if (params?.postId) {
        try {
          const fetchedComments = await getCommentsByPostId(params.postId);
          setCommentsByPost(params.postId, fetchedComments || []);
          setLikesByPost(params.postId);
        } catch (error) {
          console.error("Failed to fetch data on mount:", error);
          setCommentsByPost(params.postId, []);
        }
      }
    };

    fetchData();
  }, [params?.postId, setCommentsByPost, setLikesByPost]);

  useEffect(() => {
    if (likesByPost.length < 1 || !contextUser?.user?.id) {
      setUserLiked(false);
      return;
    }

    setUserLiked(isLiked);
  }, [isLiked, likesByPost, contextUser?.user?.id]);

  const like = async () => {
    try {
      setHasClickedLike(true);
      await createLike(contextUser?.user?.id || "", params.postId, post.profile.user_id);
      setLikesByPost(params.postId);
      setHasClickedLike(false);
    } catch (error) {
      console.log(error);
      alert(error);
      setHasClickedLike(false);
    }
  };

  const unlike = async (id: string) => {
    try {
      setHasClickedLike(true);
      await deleteLike(id);
      setLikesByPost(params.postId);
      setHasClickedLike(false);
    } catch (error) {
      console.log(error);
      alert(error);
      setHasClickedLike(false);
    }
  };

  const likeOrUnlike = () => {
    if (!contextUser?.user) return setIsLoginOpen(true);

    if (!isLiked) {
      like();
    } else {
      likesByPost.forEach((like) => {
        if (
          contextUser?.user?.id &&
          contextUser.user.id === like.user_id &&
          like.post_id === params.postId
        ) {
          unlike(like.id);
        }
      });
    }
  };

  const deletePost = async () => {
    const res = confirm("Bạn có chắc chắn muốn xóa bài post?");
    if (!res) return;

    setIsDeleteing(true);

    try {
      await deletePostById(params?.postId, post?.video_id);
      router.push(`/profile/${params.userId}`);
      setIsDeleteing(false);
    } catch (error) {
      console.log(error);
      setIsDeleteing(false);
      alert(error);
    }
  };

  const comments = commentsByPost[params.postId] || [];

  return (
    <>
      <div className="flex items-center justify-between px-8">
        <div className="flex items-center">
          <Link href={`/profile/${post?.user_id}`}>
            {imageUrl ? (
              <img
                className="rounded-full lg:mx-0 mx-auto"
                width="40"
                src={imageUrl}
                alt="User Profile"
              />
            ) : (
              <div className="w-[40px] h-[40px] bg-gray-200 rounded-full"></div>
            )}
          </Link>
          <div className="ml-3 pt-0.5">
            <Link
              href={`/profile/${post?.user_id}`}
              className="relative z-10 text-[17px] font-semibold hover:underline"
            >
              {post?.profile.name}
            </Link>

            <div className="relative z-0 text-[13px] -mt-5 font-light">
              _{post?.profile.name}_
              <span className="relative -top-[2px] text-[30px] pl-1 pr-0.5 ">
                .
              </span>
              <span className="font-medium">
                {moment(post?.created_at).calendar()}
              </span>
            </div>
          </div>
        </div>

        {contextUser?.user?.id == post?.user_id ? (
          <div>
            {isDeleteing ? (
              <BiLoaderCircle className="animate-spin" size="25" />
            ) : (
              <button disabled={isDeleteing} onClick={() => deletePost()}>
                <BsTrash3 className="cursor-pointer" size="25" />
              </button>
            )}
          </div>
        ) : null}
      </div>

      <p className="px-8 mt-4 text-sm">{post?.text}</p>

      <p className="flex item-center gap-2 px-8 mt-4 text-sm font-bold">
        <ImMusic size="17" />
        original sound - {post?.profile.name}
      </p>

      <div className="flex items-center px-8 mt-8">
        <ClientOnly>
          <div className="pb-4 text-center flex items-center">
            <button
              disabled={hasClickedLike}
              onClick={() => likeOrUnlike()}
              className="rounded-full bg-gray-200 p-2 cursor-pointer"
            >
              {!hasClickedLike ? (
                <AiFillHeart
                  color={likesByPost.length > 0 && userLiked ? "#ff2626" : ""}
                  size="25"
                />
              ) : (
                <BiLoaderCircle className="animate-spin" size="25" />
              )}
            </button>
            <span className="text-xs pl-2 pr-4 text-gray-800 font-semibold">
              {likesByPost.length}
            </span>
          </div>
        </ClientOnly>

        <div className="pb-4 text-center flex items-center">
          <div className="rounded-full bg-gray-200 p-2 cursor-pointer">
            <BsChatDots size={25} />
          </div>
          <span className="text-xs pl-2 text-gray-800 font-semibold">
            {comments.length}
          </span>
        </div>
      </div>
    </>
  );
}