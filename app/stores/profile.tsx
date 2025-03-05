import { create } from "zustand";
import { persist, devtools, createJSONStorage } from "zustand/middleware";
import { Profile } from "../types";

interface ProfileStore {
  currentProfile: Profile | null;
  setCurrentProfile: (profile: Profile | null) => void;
}

export const useProfileStore = create<ProfileStore>()(
  devtools(
    persist(
      (set) => ({
        currentProfile: null,

        setCurrentProfile: (profile: Profile | null) => {
          set({ currentProfile: profile });
        },
      }),
      {
        name: "store",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);
