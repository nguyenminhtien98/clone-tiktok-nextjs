"use client";

import React, { useEffect, useState } from "react";
import UploadLayout from "../layouts/UploadLayout";
import { BiLoaderCircle, BiSolidCloudUpload } from "react-icons/bi";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/user";
import { UploadError } from "../types";
import createPost from "../hooks/useCreatePost";

export default function Upload() {
  const contextUser = useUser();
  const router = useRouter();

  const [fileDisplay, setFileDisplay] = useState<string>("");
  const [caption, setCaption] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<UploadError | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [videoId, setVideoId] = useState<string>("");

  useEffect(() => {
    if (!contextUser?.user) router.push("/");
  }, [contextUser]);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const fileUrl = URL.createObjectURL(file);
      setFileDisplay(fileUrl);
      setFile(file);
    }
  };

  const discard = () => {
    setFileDisplay("");
    setFile(null);
    setCaption("");
    setVideoId("");
  };

  const clearVideo = () => {
    setFileDisplay("");
    setFile(null);
  };

  const validate = () => {
    setError(null);
    let isError = false;

    if (!file) {
      setError({ type: "File", message: "A video is required" });
      isError = true;
    } else if (!caption) {
      setError({ type: "caption", message: "A caption is required" });
      isError = true;
    }
    return isError;
  };

  const createNewPost = async () => {
    const isError = validate();
    if (isError) return;
    if (!file || !contextUser?.user) return;
    setIsUploading(true);

    try {
      const newVideoUrl = await createPost(
        file,
        contextUser?.user?.id,
        caption
      );
      setVideoId(newVideoUrl);

      console.log("Creating post with:", {
        user_id: contextUser?.user?.id,
        text: caption,
        video_url: newVideoUrl,
        created_at: new Date().toISOString(),
      });

      router.push(`/profile/${contextUser?.user?.id}`);
      setIsUploading(false);
    } catch (error) {
      console.log(error);
      setIsUploading(false);
      alert(error);
    }
  };

  return (
    <UploadLayout>
      <div className="w-full mt-[80px] mb-[40px] bg-white shadow-lg rounded-md py-6 md:px-10 px-4">
        <div>
          <h1 className="text-[23px] font-semibold">Upload video</h1>
          <h2 className="text-gray-400 mt-1">Post a video to your account</h2>
        </div>

        <div className="mt-8 md:flex gap-6">
          {!fileDisplay ? (
            <label
              htmlFor="fileInput"
              className="md:mx-0 mx-auto mt-4 mb-6 flex flex-col items-center justify-center w-full max-w-[260px] h-[470px] text-center p-3 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <BiSolidCloudUpload size="40" color="#b3b3b1" />
              <p className="mt-4 text-[17px]">Select video to upload</p>
              <p className="mt-1.5 text-gray-500 text-[13px]">
                Or drag and drop a file
              </p>
              <p className="mt-12 text-gray-400 text-sm">MP4</p>
              <p className="mt-2 text-gray-400 text-[13px]">Up to 30 minutes</p>
              <p className="mt-2 text-gray-400 text-[13px]">Less than 2 GB</p>
              <label
                htmlFor="fileInput"
                className="px-2 py-1.5 mt-8 text-white text-[15px] w-[80%] bg-[#F02C56] rounded-sm cursor-pointer"
              >
                Chọn video
              </label>
              <input
                type="file"
                id="fileInput"
                onChange={onChange}
                hidden
                accept=".mp4"
              />
            </label>
          ) : (
            <div className="md:mx-0 mx-auto mt-4 md:mb-12 mb-16 flex items-center justify-center w-full max-w-[260px] h-[540px] p-3 rounded-2xl cursor-pointer relative">
              {isUploading && (
                <div className="absolute flex items-center justify-center z-20 bg-black h-full w-full rounded-[50px] bg-opacity-50">
                  <div className="mx-auto flex items-center justify-center gap-1">
                    <BiLoaderCircle
                      className="animate-spin"
                      color="#F12B56"
                      size={30}
                    />
                    <div className="text-white font-bold">Uploading...</div>
                  </div>
                </div>
              )}

              <video
                autoPlay
                loop
                muted
                className="absolute rounded-xl object-cover z-10 p-[13px] w-full h-full"
                src={fileDisplay}
              />
              <div className="absolute -bottom-12 flex items-center justify-between z-50 rounded-xl border w-full p-2 border-gray-300">
                <div className="flex items-center truncate">
                  <AiOutlineCheckCircle size="16" className="min-w-[16px]" />
                  <p className="text-[11px] pl-1 truncate text-ellipsis">
                    {file?.name}
                  </p>
                </div>
                <button
                  onClick={() => clearVideo()}
                  className="text-[11px] ml-2 font-semibold"
                >
                  Change
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 mb-6">
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <div className="mb-1 text-[15px]">Caption</div>
                <div className="text-gray-400 text-[12px]">
                  {caption.length}/150
                </div>
              </div>
              <input
                maxLength={150}
                type="text"
                className="w-full border p-2.5 rounded-md focus:outline-none"
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button
                disabled={isUploading}
                onClick={() => discard()}
                className="px-10 py-2.5 mt-8 border text-[16px] hover:bg-gray-100 rounded-sm"
              >
                Hủy bỏ
              </button>
              <button
                disabled={isUploading}
                onClick={() => createNewPost()}
                className="px-10 py-2.5 mt-8 border text-[16px] text-white bg-[#F02C56] rounded-sm"
              >
                {isUploading ? (
                  <BiLoaderCircle
                    className="animate-spin"
                    color="#ffffff"
                    size={25}
                  />
                ) : (
                  "Đăng"
                )}
              </button>
            </div>

            {error && <div className="text-red-600 mt-4">{error.message}</div>}
          </div>
        </div>
      </div>
    </UploadLayout>
  );
}
