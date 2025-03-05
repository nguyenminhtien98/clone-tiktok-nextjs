"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { account, ID, database, Query } from "../libs/AppWriteClient";
import { User, UserContextTypes } from "../types";
import { useRouter } from "next/navigation";
import getProfileByUserId from "../hooks/getProfileByUserId";

const defaultContext: UserContextTypes = {
  user: null,
  register: async () => {},
  login: async () => {},
  logout: async () => {},
  checkUser: async () => {},
  followUser: async () => {},
  unfollowUser: async () => {},
  isFollowing: async () => false,
  getFollowingList: async () => [],
};

const UserContext = createContext<UserContextTypes>(defaultContext);

const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    try {
      const sessions = await account.listSessions();
      
      if (sessions.total === 0) {
        setUser(null);
        setLoading(false);
        return null;
      }

      const currentUser = await account.get();
      
      const profile = await getProfileByUserId(currentUser.$id);

      if (!profile) {
        setUser(null);
        setLoading(false);
        return null;
      }

      const userData = {
        id: currentUser.$id,
        name: currentUser.name,
        bio: profile.bio,
        image: profile.image,
      };

      setUser(userData);
      setLoading(false);
      return userData;
    } catch (error: any) {
      console.log(error);
      setUser(null);
      setLoading(false);
      return null;
    }
  };

  useEffect(() => {
    const verifyUser = async () => {
      await checkUser();
    };
    verifyUser();
  }, []);

  const createProfile = async (userId: string, name: string, image: string, bio: string) => {
    try {
      await database.createDocument(
        String(process.env.NEXT_PUBLIC_DATABASE_ID),
        String(process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE),
        userId,
        {
          user_id: userId,
          name: name,
          image: image,
          bio: bio,
        }
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      if (!email || !password || password.length < 8) {
        throw new Error("Invalid email or password. Password must be at least 8 characters.");
      }

      try {
        await account.deleteSession("current").catch(() => {});
      } catch (error) {
        console.log(error);
      }

      const promise = await account.create(ID.unique(), email, password, name);
      if (!promise || !promise.$id) {
        throw new Error("Failed to create account");
      }

      await account.createEmailPasswordSession(email, password);

      const defaultImageId = String(process.env.NEXT_PUBLIC_PLACEHOLDER_DEFAULT_IMAGE_ID);
      if (!defaultImageId) {
        throw new Error("Default avatar ID is not defined in environment variables.");
      }

      await createProfile(promise.$id, name, defaultImageId, "");
      await checkUser();
    } catch (error: any) {
      if (error.message.includes("A user with the same id, email, or phone already exists")) {
        throw new Error("A user with this email already exists. Please use a different email or log in.");
      }
      console.error(error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const session = await account.createEmailPasswordSession(email, password);
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const userData = await checkUser();
      
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const followUser = async (followingId: string) => {
    if (!user) throw new Error("You must be logged in to follow.");

    try {
      await database.createDocument(
        String(process.env.NEXT_PUBLIC_DATABASE_ID),
        String(process.env.NEXT_PUBLIC_COLLECTION_ID_FOLLOWS),
        ID.unique(),
        {
          followerId: user.id,
          followingId: followingId,
        }
      );
      console.log(`User ${user.id} followed ${followingId}`);
      await checkUser();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const unfollowUser = async (followingId: string) => {
    if (!user) throw new Error("You must be logged in to unfollow.");

    try {
      const response = await database.listDocuments(
        String(process.env.NEXT_PUBLIC_DATABASE_ID),
        String(process.env.NEXT_PUBLIC_COLLECTION_ID_FOLLOWS),
        [
          Query.equal("followerId", user.id),
          Query.equal("followingId", followingId),
        ]
      );
      if (response.documents.length > 0) {
        const followDocId = response.documents[0].$id;
        await database.deleteDocument(
          String(process.env.NEXT_PUBLIC_DATABASE_ID),
          String(process.env.NEXT_PUBLIC_COLLECTION_ID_FOLLOWS),
          followDocId
        );
        console.log(`User ${user.id} unfollowed ${followingId}`);
        await checkUser();
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const isFollowing = async (followingId: string) => {
    if (!user) return false;

    try {
      const response = await database.listDocuments(
        String(process.env.NEXT_PUBLIC_DATABASE_ID),
        String(process.env.NEXT_PUBLIC_COLLECTION_ID_FOLLOWS),
        [
          Query.equal("followerId", user.id),
          Query.equal("followingId", followingId),
        ]
      );
      return response.documents.length > 0;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const getFollowingList = async () => {
    if (!user) return [];

    try {
      const response = await database.listDocuments(
        String(process.env.NEXT_PUBLIC_DATABASE_ID),
        String(process.env.NEXT_PUBLIC_COLLECTION_ID_FOLLOWS),
        [Query.equal("followerId", user.id)]
      );

      const followingIds = response.documents.map((doc) => doc.followingId);
      const profiles = [];

      for (const followingId of followingIds) {
        const profile = await getProfileByUserId(followingId);
        if (profile) {
          profiles.push({
            id: followingId,
            name: profile.name,
            image: profile.image,
          });
        }
      }

      return profiles;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        register,
        login,
        logout,
        checkUser,
        followUser,
        unfollowUser,
        isFollowing,
        getFollowingList,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;

export const useUser = () => useContext(UserContext);
