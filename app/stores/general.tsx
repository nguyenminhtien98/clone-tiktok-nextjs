import getRandomUsers from "../hooks/useGetRandomUsers";

interface GeneralStore {
  isLoginOpen: boolean;
  isEditProfileOpen: boolean;
  randomUsers: RandomUsers[];
  setIsLoginOpen: (val: boolean) => void;
  setIsEditProfileOpen: (val: boolean) => void;
  setRandomUsers: () => void;
}

import { create } from 'zustand';
import { persist, devtools, createJSONStorage } from 'zustand/middleware';
import { RandomUsers } from '../types';
  
interface GeneralStore {
    isLoginOpen: boolean,
    isEditProfileOpen: boolean,
    randomUsers: RandomUsers[]
    setIsLoginOpen: (val: boolean) => void,
    setIsEditProfileOpen: (val: boolean) => void,
    setRandomUsers: () => void,
}

export const useGeneralStore = create<GeneralStore>()( 
    devtools(
        persist(
            (set) => ({
                isLoginOpen: false,
                isEditProfileOpen: false,
                randomUsers: [],

                setIsLoginOpen: (val: boolean) => set({ isLoginOpen: val }),
                setIsEditProfileOpen: (val: boolean) => set({ isEditProfileOpen: val }),
                setRandomUsers: async () => {
                    const result = await getRandomUsers()
                    set({ randomUsers: result })
                },
            }),
            { 
                name: 'store', 
                storage: createJSONStorage(() => localStorage) 
            }
        )
    )
)
