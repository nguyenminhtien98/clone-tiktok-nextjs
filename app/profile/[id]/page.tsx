"use client";

import PostUser from "../../components/profile/PostUser";
import MainLayout from "../../layouts/MainLayout";
import { BsPencil } from "react-icons/bs";
import { use, useEffect, useState } from "react";
import { useUser } from "../../context/user";
import ClientOnly from "../../components/ClientOnly";
import { ProfilePageTypes, User } from "../../types";
import { usePostStore } from "../../stores/post";
import { useProfileStore } from "../../stores/profile";
import { useGeneralStore } from "../../stores/general";
import useCreateBucketUrl from "../../hooks/useCreateBucketUrl";
import { database, Query } from "@/app/libs/AppWriteClient";
import Loading from "@/app/components/Loading";

export default function Profile({ params }: ProfilePageTypes) {
  const contextUser = useUser();
  const { postsByUser, setPostsByUser } = usePostStore();
  const { currentProfile, setCurrentProfile } = useProfileStore();
  const { isEditProfileOpen, setIsEditProfileOpen } = useGeneralStore();
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const defaultAvatarId =
    process.env.NEXT_PUBLIC_PLACEHOLDER_DEFAULT_IMAGE_ID ||
    "67c2f8040021729661b7";
  const imageUrl = useCreateBucketUrl(currentProfile?.image || defaultAvatarId);

  const unwrappedParams = use(params);
  const userId = unwrappedParams.id;

  useEffect(() => {
    if (contextUser.user) {
      checkFollowStatus();
      fetchFollowCounts();
    }
  }, [contextUser.user]);

  useEffect(() => {
    const onFollowed = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.userId === userId) {
        checkFollowStatus();
        fetchFollowCounts();
      }
    };
    window.addEventListener("user-followed", onFollowed);
    return () => window.removeEventListener("user-followed", onFollowed);
  }, [userId]);

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      setLoading(true);
      try {
        let profileResponse;
        try {
          profileResponse = await database.getDocument(
            String(process.env.NEXT_PUBLIC_DATABASE_ID),
            String(process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE),
            userId
          );
        } catch (error) {
          console.log(error);
          const listResponse = await database.listDocuments(
            String(process.env.NEXT_PUBLIC_DATABASE_ID),
            String(process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE),
            [Query.equal("user_id", userId)]
          );
          if (listResponse.documents.length > 0) {
            profileResponse = listResponse.documents[0];
          } else {
            throw new Error("Profile not found");
          }
        }

        setCurrentProfile({
          id: profileResponse.$id,
          user_id: profileResponse.user_id,
          name: profileResponse.name,
          image: profileResponse.image,
          bio: profileResponse.bio,
        });

        await setPostsByUser(userId);
        checkFollowStatus();
        fetchFollowCounts();
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile or posts:", error);
        setCurrentProfile(null);
      }
    };

    fetchProfileAndPosts();
  }, [userId]);

  const checkFollowStatus = async () => {
    if (contextUser?.user && contextUser.isFollowing) {
      const following = await contextUser.isFollowing(userId);
      setIsFollowingUser(following);
    }
  };

  const fetchFollowCounts = async () => {
    try {
      const followingResponse = await database.listDocuments(
        String(process.env.NEXT_PUBLIC_DATABASE_ID),
        String(process.env.NEXT_PUBLIC_COLLECTION_ID_FOLLOWS),
        [Query.equal("followerId", userId)]
      );
      const followersResponse = await database.listDocuments(
        String(process.env.NEXT_PUBLIC_DATABASE_ID),
        String(process.env.NEXT_PUBLIC_COLLECTION_ID_FOLLOWS),
        [Query.equal("followingId", userId)]
      );
      setFollowingCount(followingResponse.total);
      setFollowersCount(followersResponse.total);
    } catch (error) {
      console.error("Error fetching follow counts:", error);
    }
  };

  const handleFollowToggle = async () => {
    if (!contextUser?.user) return;
    try {
      if (isFollowingUser) {
        await contextUser.unfollowUser(userId);
      } else {
        await contextUser.followUser(userId);
      }
      setIsFollowingUser(!isFollowingUser);
      fetchFollowCounts();
    } catch (error) {
      console.error("Follow toggle error:", error);
    }
  };

  return (
    <>
      <MainLayout>
        <div className="pt-[90px] ml-[90px] 2xl:pl-[275px] lg:pl-[250px] lg:pr-0 w-[calc(100%-90px)] pr-3 max-w-[1800px] 2xl:mx-auto">
          {loading ? (<Loading />) : (
            <>
              <div className="flex w-[calc(100vw-230px)]">
                <ClientOnly>
                  {currentProfile ? (
                    <img
                      className="w-[120px] min-w-[120px] rounded-full"
                      src={imageUrl}
                      alt="Profile Image"
                    />
                  ) : (
                    <div className="min-w-[150px] h-[120px] bg-gray-200 rounded-full" />
                  )}
                </ClientOnly>

                <div className="ml-5 w-full">
                  <ClientOnly>
                    {(currentProfile as User)?.name ? (
                      <div>
                        <p className="text-[30px] font-bold truncate">
                          {currentProfile?.name}
                        </p>
                        <p className="text-[18px] truncate">
                          _{currentProfile?.name}_
                        </p>
                      </div>
                    ) : (
                      <div className="h-[60px]" />
                    )}
                  </ClientOnly>

                  {contextUser?.user?.id === userId ? (
                    <button
                      onClick={() => setIsEditProfileOpen(!isEditProfileOpen)}
                      className="flex item-center rounded-md py-1.5 px-3.5 mt-3 text-[15px] font-semibold border hover:bg-gray-100"
                    >
                      <BsPencil className="mt-0.5 mr-1" size="18" />
                      <span>Sửa hồ sơ</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleFollowToggle}
                      className={`flex item-center rounded-md py-1.5 px-8 mt-3 text-[15px] font-semibold ${isFollowingUser
                        ? "bg-[#f2f2f2] text-black"
                        : "bg-[#F02C56] text-white "
                        }`}
                    >
                      {isFollowingUser ? "Đang Follow" : "Follow"}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center pt-4">
                <div className="mr-4">
                  <span className="font-bold">{followingCount}</span>
                  <span className="text-gray-500 font-light text-[15px] pl-1.5">
                    Đang Follow
                  </span>
                </div>
                <div className="mr-4">
                  <span className="font-bold">{followersCount}</span>
                  <span className="text-gray-500 font-light text-[15px] pl-1.5">
                    Followers
                  </span>
                </div>
              </div>

              <ClientOnly>
                <p className="pt-4 mr-4 text-gray-500 font-light text-[15px] pl-1.5 max-w-[500px]">
                  {currentProfile?.bio}
                </p>
              </ClientOnly>

              <ul className="w-full flex items-center pt-4 border-b">
                <li className="w-60 text-center py-2 text-[17px] font-semibold border-b-2 border-b-black">
                  Videos
                </li>
                <li className="w-60 text-gray-500 text-center py-2 text-[17px] font-semibold">
                  Liked
                </li>
              </ul>

              <ClientOnly>
                <div className="mt-4 grid 2xl:grid-cols-6 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-3">
                  {postsByUser?.map((post, index) => (
                    <PostUser key={index} post={post} />
                  ))}
                </div>
              </ClientOnly>

              <div className="pb-20" />
            </>
          )}


        </div>
      </MainLayout>
    </>
  );
}
