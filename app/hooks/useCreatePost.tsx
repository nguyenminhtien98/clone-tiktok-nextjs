import { database, storage, ID } from "../libs/AppWriteClient";
import { Permission, Role } from "appwrite";

const createPost = async (file: File, userId: string, caption: string) => {
  if (!file) {
    throw new Error("Please select a video file to upload.");
  }

  try {
    const uploadedFile = await storage.createFile(
      String(process.env.NEXT_PUBLIC_BUCKET_ID),
      ID.unique(),
      file,
      [Permission.read(Role.users()), Permission.write(Role.user(userId))]
    );

    if (!uploadedFile) {
      throw new Error("File upload failed.");
    }

    const videoId = uploadedFile.$id;

    const postData = {
      user_id: userId,
      text: caption,
      video_id: videoId,
      created_at: new Date().toISOString(),
    };
    console.log("Creating document with data:", postData);

    const post = await database.createDocument(
      String(process.env.NEXT_PUBLIC_DATABASE_ID),
      String(process.env.NEXT_PUBLIC_COLLECTION_ID_POST),
      ID.unique(),
      postData
    );

    console.log("Post created successfully:", post);

    const videoUrl = `${process.env.NEXT_PUBLIC_APPWRITE_URL}/storage/buckets/${process.env.NEXT_PUBLIC_BUCKET_ID}/files/${videoId}/view?project=${process.env.NEXT_PUBLIC_PROJECT_ID}`;
    return videoUrl;
  } catch (error) {
    console.log("Error creating post:", error);
    throw new Error("Failed to create post or upload video. Please try again.");
  }
};

export default createPost;
