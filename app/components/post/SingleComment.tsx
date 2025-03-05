import { useUser } from "../../context/user";
import Link from "next/link";
import { useState } from "react";
import { BiLoaderCircle } from "react-icons/bi";
import { BsTrash3 } from "react-icons/bs";
import { useCommentStore } from "../../stores/comment";
import moment from "moment";
import useDeleteComment from "../../hooks/useDeleteComment";
import useCreateBucketUrl from "../../hooks/useCreateBucketUrl";
import getCommentsByPostId from "../../hooks/useGetCommentsByPostId";
import { SingleCommentCompTypes } from "../../types";

export default function SingleComment({
  comment,
  params,
}: SingleCommentCompTypes) {
  const contextUser = useUser();
  const { setCommentsByPost } = useCommentStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteComment } = useDeleteComment();

  const profileImageUrl = useCreateBucketUrl(comment?.profile?.image || "");
  const profileExists = !!comment?.profile;
  const profileImage = profileExists ? profileImageUrl : "/default-avatar.png";

  const deleteThisComment = async () => {
    const res = confirm("Bạn có chắc chắn muốn xóa commnet?");
    if (!res) return;

    try {
      setIsDeleting(true);
      await deleteComment(comment?.id);
      const updatedComments = await getCommentsByPostId(params?.postId || "");
      setCommentsByPost(params?.postId || "", updatedComments);
      setIsDeleting(false);
    } catch (error) {
      console.log(error);
      alert(error);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        id="SingleComment"
        className="flex items-center justify-between px-8 mt-4"
      >
        <div className="flex items-center relative w-full">
          <Link
            href={profileExists ? `/profile/${comment.profile!.user_id}` : "#"}
          >
            <img
              className="absolute top-0 rounded-full lg:mx-0 mx-auto"
              width="40"
              src={profileImage}
              alt="Profile"
            />
          </Link>
          <div className="ml-14 pt-0.5 w-full">
            <div className="text-[18px] font-semibold flex items-center justify-between">
              <span className="flex items-center">
                {profileExists ? comment?.profile?.name : "Unknown User"} -
                <span className="text-[12px] text-gray-600 font-light ml-1">
                  {moment(comment?.created_at).calendar()}
                </span>
              </span>
              {contextUser?.user?.id &&
              profileExists &&
              contextUser?.user?.id === comment.profile!.user_id ? (
                <button
                  disabled={isDeleting}
                  onClick={() => deleteThisComment()}
                >
                  {isDeleting ? (
                    <BiLoaderCircle
                      className="animate-spin"
                      color="#E91E62"
                      size="20"
                    />
                  ) : (
                    <BsTrash3 className="cursor-pointer" size="25" />
                  )}
                </button>
              ) : null}
            </div>
            <p className="text-[15px] font-light">{comment.text}</p>
          </div>
        </div>
      </div>
    </>
  );
}
