import { storage } from "../libs/AppWriteClient";
import Image from "image-js";
import { CropperDimensions } from "../types";

const changeUserImage = async (
  file: File,
  cropper: CropperDimensions | null,
  currentImage: string
) => {
  if (!cropper) {
    throw new Error("Cropper không hợp lệ hoặc chưa khởi tạo!");
  }

  const { left: x = 0, top: y = 0, width = 0, height = 0 } = cropper;

  try {
    const response = await fetch(URL.createObjectURL(file));
    const imageBuffer = await response.arrayBuffer();

    const image = await Image.load(imageBuffer);
    const croppedImage = image.crop({ x, y, width, height });
    const resizedImage = croppedImage.resize({ width: 200, height: 200 });
    const blob = await resizedImage.toBlob();
    const arrayBuffer = await blob.arrayBuffer();

    const finalFile = new File([arrayBuffer], file.name, { type: blob.type });

    const result = await storage.createFile(
      String(process.env.NEXT_PUBLIC_BUCKET_ID),
      Math.random().toString(36).slice(2, 22),
      finalFile
    );

    if (
      currentImage !==
      String(process.env.NEXT_PUBLIC_PLACEHOLDER_DEFAULT_IMAGE_ID)
    ) {
      await storage.deleteFile(
        String(process.env.NEXT_PUBLIC_BUCKET_ID),
        currentImage
      );
    }

    return result?.$id;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default changeUserImage;
