import { useState, useEffect } from "react";
import SingleComment from "./SingleComment";
import { useUser } from "../../context/user";
import { BiLoaderCircle } from "react-icons/bi";
import ClientOnly from "../ClientOnly";
import { useCommentStore } from "../../stores/comment";
import useCreateComment from "../../hooks/useCreateComment";
import { useGeneralStore } from "../../stores/general";
import { CommentsCompTypes } from "../../types";
import getCommentsByPostId from "../../hooks/useGetCommentsByPostId";

export default function Comments({ params }: CommentsCompTypes) {
  const { commentsByPost, setCommentsByPost } = useCommentStore();
  const { setIsLoginOpen } = useGeneralStore();
  const contextUser = useUser();
  const [comment, setComment] = useState<string>("");
  const [inputFocused, setInputFocused] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const { createComment } = useCreateComment();

  const comments = commentsByPost[params.postId] || [];

  useEffect(() => {
    const fetchComments = async () => {
      if (params?.postId) {
        try {
          const fetchedComments = await getCommentsByPostId(params.postId);
          setCommentsByPost(params.postId, fetchedComments || []);
        } catch (error) {
          console.error("Failed to fetch comments on mount:", error);
          setCommentsByPost(params.postId, []);
        }
      }
    };

    fetchComments();
  }, [params.postId, setCommentsByPost]);

  const addComment = async () => {
    if (!contextUser?.user) return setIsLoginOpen(true);

    try {
      setIsUploading(true);
      await createComment(contextUser?.user?.id, params?.postId, comment, params.userId);
      const updatedComments = await getCommentsByPostId(params?.postId) || [];
      setCommentsByPost(params?.postId, updatedComments);
      setComment("");
      setIsUploading(false);
    } catch (error) {
      console.log(error);
      alert(error);
      setIsUploading(false);
    }
  };

  return (
    <>
      <div
        id="Comments"
        className="relative bg-[#F8F8F8] z-0 w-full h-[calc(100%-273px)] border-t-2 overflow-auto"
      >
        <div className="pt-2" />

        <ClientOnly>
          {comments.length < 1 ? (
            <div className="text-center mt-6 text-xl text-gray-500">
              No comments...
            </div>
          ) : (
            <div>
              {comments.map((comment) => (
                <SingleComment key={comment.id} comment={comment} params={params} />
              ))}
            </div>
          )}
        </ClientOnly>

        <div className="mb-28" />
      </div>

      <div
        id="CreateComment"
        className="absolute flex items-center justify-between bottom-0 bg-white h-[85px] lg:max-w-[550px] w-full py-5 px-8 border-t-2"
      >
        <div
          className={`
            bg-[#F1F1F2] flex items-center rounded-lg w-full lg:max-w-[420px]
            ${inputFocused ? "border-2 border-gray-400" : "border-2 border-[#F1F1F2]"}
          `}
        >
          <input
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            onChange={(e) => setComment(e.target.value)}
            value={comment || ""}
            className="bg-[#F1F1F2] text-[14px] focus:outline-none w-full lg:max-w-[420px] p-2 rounded-lg"
            type="text"
            placeholder="Add comment..."
          />
        </div>
        {!isUploading ? (
          <button
            disabled={!comment}
            onClick={() => addComment()}
            className={`
              font-semibold text-sm ml-5 pr-1
              ${comment ? "text-[#F02C56] cursor-pointer" : "text-gray-400"}
            `}
          >
            Post
          </button>
        ) : (
          <BiLoaderCircle className="animate-spin" color="#E91E62" size="20" />
        )}
      </div>
    </>
  );
}