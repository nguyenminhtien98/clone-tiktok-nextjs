/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import PostUser from "../../components/profile/PostUser";
import MainLayout from "../../layouts/MainLayout";
import { BsPencil } from "react-icons/bs";
import { use, useEffect, useState } from "react";
import { useUser } from "../../context/user";
import ClientOnly from "../../components/ClientOnly";
import { PostWithProfile, ProfilePageTypes, User } from "../../types";
import { usePostStore } from "../../stores/post";
import { useProfileStore } from "../../stores/profile";
import { useGeneralStore } from "../../stores/general";
import useCreateBucketUrl from "../../hooks/useCreateBucketUrl";
import { database, Query } from "@/app/libs/AppWriteClient";
import Loading from "@/app/components/Loading";
import FollowModal from "@/app/components/profile/FollowModal";
import getLikesByUser from "@/app/hooks/getLikesByUser";
import useVideoViews from "@/app/hooks/useVideoViews";

export default function Profile({ params }: ProfilePageTypes) {
  const contextUser = useUser();
  const { getViewCount } = useVideoViews();
  const { postsByUser, setPostsByUser } = usePostStore();
  const { currentProfile, setCurrentProfile } = useProfileStore();
  const { isEditProfileOpen, setIsEditProfileOpen } = useGeneralStore();
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [followTab, setFollowTab] = useState<'following' | 'followers'>('following');
  const [tab, setTab] = useState<'Videos' | 'Liked'>('Videos');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [likedPosts, setLikedPosts] = useState<PostWithProfile[]>([]);
  const [sortedPosts, setSortedPosts] = useState<PostWithProfile[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

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
    (async () => {
      setLoading(true);
      let prof;
      try {
        prof = await database.getDocument(
          String(process.env.NEXT_PUBLIC_DATABASE_ID),
          String(process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE),
          userId
        );
      } catch {
        const list = await database.listDocuments(
          String(process.env.NEXT_PUBLIC_DATABASE_ID),
          String(process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE),
          [Query.equal("user_id", userId)]
        );
        prof = list.documents[0];
      }
      setCurrentProfile({
        id: prof.$id,
        user_id: prof.user_id,
        name: prof.name,
        image: prof.image,
        bio: prof.bio,
      });
      await setPostsByUser(userId);
      setLoading(false);
    })();
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

  useEffect(() => {
    if (tab === "Liked" && likedPosts.length === 0) {
      (async () => {
        const likes = await getLikesByUser(userId);
        setLikedPosts(likes);
      })();
    }
  }, [tab, userId, likedPosts]);

  const rawPosts = tab === "Videos" ? postsByUser : likedPosts;

  useEffect(() => {
    async function sortData() {
      if (rawPosts.length === 0) {
        setSortedPosts([]);
        setPostsLoading(false);
        return;
      }
      setPostsLoading(true);
      let newSorted: PostWithProfile[] = [];
      const defaultProfile = { name: "", image: "", bio: "" };

      if (sort === "popular") {
        const postsWithViews = await Promise.all(
          rawPosts.map(async (post) => {
            const viewCount = post.video_id ? await getViewCount(post.video_id) : 0;
            const profile = (post as any).profile || defaultProfile;
            return { ...post, viewCount, profile } as PostWithProfile & { viewCount: number };
          })
        );
        newSorted = postsWithViews.sort((a, b) => b.viewCount - a.viewCount) as PostWithProfile[];
      } else if (sort === "newest") {
        newSorted = [...rawPosts]
          .map((post) => {
            const profile = (post as any).profile || defaultProfile;
            return { ...post, profile } as PostWithProfile;
          })
          .sort((a, b) => b.created_at.localeCompare(a.created_at));
      } else if (sort === "oldest") {
        newSorted = [...rawPosts]
          .map((post) => {
            const profile = (post as any).profile || defaultProfile;
            return { ...post, profile } as PostWithProfile;
          })
          .sort((a, b) => a.created_at.localeCompare(b.created_at));
      }

      await new Promise((res) => setTimeout(res, 300));

      setSortedPosts(newSorted);
      setPostsLoading(false);
    }
    sortData();
  }, [rawPosts, sort, tab]);

  return (
    <>
      <MainLayout>
        <div className="pt-[90px] ml-[90px] 2xl:pl-[275px] lg:pl-[250px] lg:pr-0 w-full pr-3 max-w-[1800px] 2xl:mx-auto overflow-x-hidden">
          {loading ? (
            <Loading />
          ) : (
            <>
              <div className="flex w-full">
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
                      className="flex items-center rounded-md py-1.5 px-3.5 mt-3 text-[15px] font-semibold border hover:bg-gray-100"
                    >
                      <BsPencil className="mt-0.5 mr-1" size="18" />
                      <span>Sửa hồ sơ</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleFollowToggle}
                      className={`flex items-center rounded-md py-1.5 px-8 mt-3 text-[15px] font-semibold ${isFollowingUser
                        ? "bg-[#f2f2f2] text-black"
                        : "bg-[#F02C56] text-white"
                        }`}
                    >
                      {isFollowingUser ? "Đang Follow" : "Follow"}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center pt-4">
                <div
                  className="mr-4 cursor-pointer"
                  onClick={() => {
                    setFollowTab("following");
                    setFollowModalOpen(true);
                  }}
                >
                  <span className="font-bold">{followingCount}</span>
                  <span className="text-gray-500 font-light text-[15px] pl-1.5">
                    Đang Follow
                  </span>
                </div>
                <div
                  className="mr-4 cursor-pointer"
                  onClick={() => {
                    setFollowTab("followers");
                    setFollowModalOpen(true);
                  }}
                >
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
              <div className="flex items-center mt-6 border-b">
                <div>
                  <button
                    onClick={() => setTab("Videos")}
                    className={`py-2 px-10 ${tab === "Videos"
                      ? "border-b-2 border-black font-semibold"
                      : "text-gray-500"
                      }`}
                  >
                    Videos
                  </button>
                  <button
                    onClick={() => setTab("Liked")}
                    className={`py-2 px-10 ${tab === "Liked"
                      ? "border-b-2 border-black font-semibold"
                      : "text-gray-500"
                      }`}
                  >
                    Liked
                  </button>
                </div>
                {tab === "Videos" && (
                  <div className="ml-auto flex space-x-2 bg-[#f2f2f1] rounded p-[3px] text-[14px]">
                    <button
                      onClick={() => setSort("newest")}
                      className={`py-1 px-3 rounded ${sort === "newest"
                        ? "bg-white font-semibold"
                        : "text-gray-500"
                        }`}
                    >
                      Mới Nhất
                    </button>
                    <button
                      onClick={() => setSort("oldest")}
                      className={`py-1 px-3 rounded ${sort === "oldest"
                        ? "bg-white font-semibold"
                        : "text-gray-500"
                        }`}
                    >
                      Cũ Nhất
                    </button>
                    <button
                      onClick={() => setSort("popular")}
                      className={`py-1 px-3 rounded ${sort === "popular"
                        ? "bg-white font-semibold"
                        : "text-gray-500"
                        }`}
                    >
                      Thịnh Hành
                    </button>
                  </div>
                )}
              </div>
              <ClientOnly>
                <div className="mt-4">
                  {postsLoading ? (
                    <div className="grid 2xl:grid-cols-6 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-3">
                      {Array.from({ length: rawPosts.length }).map((_, index) => (
                        <div
                          key={index}
                          className="w-full h-[251px] bg-gray-300 rounded animate-pulse"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid 2xl:grid-cols-6 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-3">
                      {sortedPosts.map((post, index) => (
                        <PostUser key={index} post={post} />
                      ))}
                    </div>
                  )}
                </div>
              </ClientOnly>
              <div className="pb-20" />
            </>
          )}
          <FollowModal
            isOpen={followModalOpen}
            onClose={() => setFollowModalOpen(false)}
            userId={userId}
            initialTab={followTab}
            followingCount={followingCount}
            followersCount={followersCount}
          />
        </div>
      </MainLayout>
    </>
  );
}