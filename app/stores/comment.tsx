import { create } from "zustand";
import { persist, devtools, createJSONStorage } from "zustand/middleware";
import { CommentWithProfile } from "../types";

interface CommentStore {
  commentsByPost: Record<string, CommentWithProfile[]>;
  setCommentsByPost: (postId: string, comments: CommentWithProfile[]) => void;
}

export const useCommentStore = create<CommentStore>()(
  devtools(
    persist(
      (set) => ({
        commentsByPost: {},

        setCommentsByPost: (postId: string, comments: CommentWithProfile[]) => {
          set((state) => ({
            commentsByPost: {
              ...state.commentsByPost,
              [postId]: comments,
            },
          }));
        },
      }),
      {
        name: "store",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);
