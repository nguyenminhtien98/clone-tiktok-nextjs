import useCreateBucketUrl from "../../hooks/useCreateBucketUrl";
import { MenuItemFollowCompTypes } from "../../types";
import Link from "next/link";

export default function MenuItemFollow({ user }: MenuItemFollowCompTypes) {

  const imageUrl = useCreateBucketUrl(user?.image || "");

  return (
    <>
      <Link
        href={`/profile/${user?.id}`}
        className="flex items-center hover:bg-gray-100 rounded-md w-full py-1.5 px-2"
      >
        <img
          className="rounded-full lg:mx-0 mx-auto"
          width="35"
          src={imageUrl}
        />
        <div className="lg:pl-2.5 lg:block hidden">
          <div className="flex items-center">
            <p className="font-bold text-[14px] truncate">{user?.name}</p>
          </div>

          <p className="font-light text-[12px] text-gray-600">_{user?.name}_</p>
        </div>
      </Link>
    </>
  );
}
