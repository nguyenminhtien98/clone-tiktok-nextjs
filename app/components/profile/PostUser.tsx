import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BsCaretRight } from "react-icons/bs";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import useCreateBucketUrl from "@/app/hooks/useCreateBucketUrl";
import { PostUserCompTypes } from "../../types";
import useVideoViews from "@/app/hooks/useVideoViews";
import { useUser } from "@/app/context/user";

export default function PostUser({ post }: PostUserCompTypes) {
  const { incrementView, getViewCount } = useVideoViews();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useUser() ?? {};
  const [viewCount, setViewCount] = useState(0);
  const hasViewed = useRef(false);

  useEffect(() => {
    const video = document.getElementById(
      `video${post?.id}`
    ) as HTMLVideoElement;

    setTimeout(() => {
      video.addEventListener("mouseenter", () => {
        video.play();
      });
      video.addEventListener("mouseleave", () => {
        video.pause();
      });
    }, 50);
  }, []);

  useEffect(() => {
    const fetchInitialViews = async () => {
      if (post.video_id) {
        const count = await getViewCount(post.video_id);
        setViewCount(count);
      }
    };
    fetchInitialViews();
  }, [post.video_id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !post.video_id || hasViewed.current) return;

    const handlePlay = async () => {
      if (!hasViewed.current) {
        try {
          await incrementView(post.video_id, user?.id);
          const count = await getViewCount(post.video_id);
          setViewCount(count);
          hasViewed.current = true;
        } catch (error) {
          console.error( error);
        }
      }
    };

    video.addEventListener("play", handlePlay);
    return () => video.removeEventListener("play", handlePlay);
  }, [post.video_id, user?.id]);

  const videoUrl = useCreateBucketUrl(post.video_id);

  return (
    <>
      <div className="relative brightness-90 hover:brightness-[1.1] cursor-pointer">
        {!post.video_id ? (
          <div className="absolute flex items-center justify-center top-0 left-0 aspect-[3/4] w-full object-cover rounded-md bg-black">
            <AiOutlineLoading3Quarters
              className="animate-spin ml-1"
              size="80"
              color="#FFFFFF"
            />
          </div>
        ) : (
          <>
            <Link href={`/post/${post.id}/${post.user_id}`}>
              <video
                id={`video${post.id}`}
                muted
                loop
                className="aspect-[3/4] object-cover rounded-md"
                src={videoUrl}
                ref={videoRef}
              />
            </Link>
            <div className="absolute bottom-2 left-2 text-white font-semibold px-2 py-1 rounded">
              
              <span className="flex items-center"><BsCaretRight className="custom-icon" size="17" /> {viewCount}</span>
            </div>
          </>
        )}
      </div>
    </>
  );
}
