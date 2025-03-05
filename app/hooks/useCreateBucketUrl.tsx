// import { storage } from "../libs/AppWriteClient";

const useCreateBucketUrl = (fileId: string | null | undefined) => {
  const appWriteUrl = process.env.NEXT_PUBLIC_APPWRITE_URL;
  const bucketId = process.env.NEXT_PUBLIC_BUCKET_ID;
  const endpoint = process.env.NEXT_PUBLIC_PROJECT_ID;
  const placeholderFileId = process.env.NEXT_PUBLIC_PLACEHOLDER_DEFAULT_IMAGE_ID;

  if (!fileId || fileId === "") {
    if (!appWriteUrl || !bucketId || !endpoint || !placeholderFileId) {
      console.error("Missing environment variables for placeholder image");
      return undefined;
    }
    return `${appWriteUrl}/storage/buckets/${bucketId}/files/${placeholderFileId}/preview?project=${endpoint}&width=60&height=60`;
  }

  if (!appWriteUrl || !bucketId || !endpoint) {
    return undefined;
  }

  return `${appWriteUrl}/storage/buckets/${bucketId}/files/${fileId}/view?project=${endpoint}`;
};

export default useCreateBucketUrl;