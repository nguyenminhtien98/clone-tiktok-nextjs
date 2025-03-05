export interface RandomUsers {
  id: string;
  name: string;
  image: string | null | undefined;
}

export interface UserContextTypes {
  user: User | null;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkUser: () => Promise<void>;
  followUser: (followingId: string) => Promise<void>;
  unfollowUser: (followingId: string) => Promise<void>;
  isFollowing: (followingId: string) => Promise<boolean>;
  getFollowingList: () => Promise<FollowingUser[]>;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  image?: string | null | undefined;
  bio?: string | null | undefined;
}

export interface User {
  id: string;
  name: string;
  bio: string | null | undefined;
  image: string | null | undefined;
}

export interface PostWithProfile {
  id: string;
  user_id: string;
  video_id: string;
  text: string;
  created_at: string;
  profile: {
    user_id: string;
    name: string | undefined; // Cho phép name là string hoặc undefined
    image: string | null | undefined;
  };
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
}

export interface Post {
  id: string;
  user_id: string;
  video_id: string;
  text: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string | null;
  post_id: string | null;
  text: string;
  created_at: string;
  profile: Profile | null;
}

export interface CommentWithProfile {
  id: string;
  user_id: string;
  post_id: string;
  text: string;
  created_at: string;
  profile: Profile | null;
}

export interface ShowErrorObject {
  type: string;
  message: string;
}

export interface CropperDimensions {
  left: number | undefined;
  top: number | undefined;
  width: number | undefined;
  height: number | undefined;
}

export interface UploadError {
  type: string;
  message: string;
}

//Component
export interface PostMainCompTypes {
  post: PostWithProfile;
}

export interface TextInputCompTypes {
  string: string;
  inputType: string;
  placeholder: string;
  onUpdate: (newValue: string) => void;
  error: string;
}

export interface PostUserCompTypes {
  post: Post;
}

export interface CommentsCompTypes {
  params: { userId: string; postId: string };
}

export interface SingleCommentCompTypes {
  params: { userId: string; postId: string };
  comment: CommentWithProfile;
}

export interface CommentsHeaderCompTypes {
  params: { userId: string; postId: string };
  post: PostWithProfile;
}

export interface ProfilePageTypes {
  params: Promise<{ id: string }>;
}

export interface FollowingUser {
  id: string;
  name: string;
  image: string | null | undefined;
}

//Layout
export interface MenuItemTypes {
  iconString: string;
  colorString: string;
  sizeString: string;
}

export interface MenuItemFollowCompTypes {
  user: RandomUsers;
}

export interface PostMainLikesCompTypes {
  post: PostWithProfile;
}

export interface PostPageTypes {
  params: Promise<{ userId: string; postId: string }>;
}
