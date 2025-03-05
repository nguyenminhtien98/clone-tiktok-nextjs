import { create } from "zustand";
import { persist, devtools, createJSONStorage } from "zustand/middleware";
import { Post, PostWithProfile } from "../types";
import getPostsByUser from "../hooks/useGetProfileByUserId";
import getPostById from "../hooks/useGetPostById";
import getAllPosts from "../hooks/useGetAllPosts";

interface PostStore {
  allPosts: PostWithProfile[];
  postsByUser: Post[];
  postById: PostWithProfile | null;
  setAllPosts: () => void;
  setPostsByUser: (userId: string) => Promise<void>;
  setPostById: (postId: string) => Promise<void>;
}

export const usePostStore = create<PostStore>()(
  devtools(
    persist(
      (set) => ({
        allPosts: [],
        postsByUser: [],
        postById: null,

        setAllPosts: async () => {
          const result = await getAllPosts();
          set({ allPosts: result });
        },
        setPostsByUser: async (userId: string) => {
          const result = await getPostsByUser(userId);
          set({ postsByUser: result });
        },
        setPostById: async (postId: string) => {
          const result = await getPostById(postId);
          set({ postById: result });
        },
      }),
      {
        name: "store",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);