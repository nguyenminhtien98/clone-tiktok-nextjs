import Link from "next/link";
import { usePathname } from "next/navigation";
import MenuItem from "./MenuItem";
import MenuItemFollow from "./MenuItemFollow";
import { useEffect, useState } from "react";
import { useUser } from "../../context/user";
import ClientOnly from "../../components/ClientOnly";
import { FollowingUser } from "@/app/types";
import getRandomUsers from "@/app/hooks/useGetRandomUsers";

export default function SideNavMain() {
  const { user, getFollowingList } = useUser();
  const [randomUsers, setRandomUsers] = useState<FollowingUser[]>([]);
  const [followingList, setFollowingList] = useState<FollowingUser[]>([]);

  const pathname = usePathname();

  useEffect(() => {
    const fetchRandomUsers = async () => {
      const list = await getRandomUsers(user ? user.id : null, 5);
      setRandomUsers(list);
    };
    fetchRandomUsers();
  }, [user]);

  useEffect(() => {
    const fetchFollowing = async () => {
      if (user) {
        try {
          const list = await getFollowingList();
          setFollowingList(list);
        } catch (error) {
          console.error("Error fetching following list:", error);
          setFollowingList([]);
        }
      } else {
        setFollowingList([]);
      }
    };
    fetchFollowing();
  }, [user, getFollowingList]);

  return (
    <>
      <div
        id="SideNavMain"
        className={`
                    fixed z-20 bg-white pt-[70px] h-full lg:border-r-0 border-r w-[75px] overflow-auto
                    ${pathname === "/" ? "lg:w-[310px]" : "lg:w-[220px]"}
                `}
      >
        <div className="lg:w-full w-[55px] mx-auto">
          <Link href="/">
            <MenuItem
              iconString="Dành cho bạn"
              colorString={pathname == "/" ? "#F02C56" : ""}
              sizeString="25"
            />
          </Link>
          <MenuItem
            iconString="Following"
            colorString="#000000"
            sizeString="25"
          />
          <MenuItem iconString="LIVE" colorString="#000000" sizeString="25" />

          <div className="border-b lg:ml-2 mt-2" />
          {randomUsers.length > 0 ? (
            <>
              <h3 className="lg:block hidden text-xs text-gray-600 font-semibold pt-4 pb-2 px-2">
                Tài khoản đề xuất
              </h3>

              <div className="lg:hidden block pt-3" />
              <ClientOnly>
                <div className="cursor-pointer">
                  {randomUsers?.map((user, index) => (
                    <MenuItemFollow key={index} user={user} />
                  ))}
                </div>
              </ClientOnly>

              <button className="lg:block hidden text-[#F02C56] pt-1.5 pl-2 text-[13px]">
                See all
              </button>
              <div className="lg:block hidden border-b lg:ml-2 mt-2" />
            </>
          ) : null}

          {followingList.length > 0 ? (
            <>
              <div>
                <h3 className="lg:block hidden text-xs text-gray-600 font-semibold pt-4 pb-2 px-2">
                  Các tài khoản đã follow
                </h3>

                <div className="lg:hidden block pt-3" />
                <ClientOnly>
                  <div className="cursor-pointer">
                    {followingList.map((following, index) => (
                      <MenuItemFollow key={index} user={following} />
                    ))}
                  </div>
                </ClientOnly>

                <button className="lg:block hidden text-[#F02C56] pt-1.5 pl-2 text-[13px]">
                  See more
                </button>
              </div>
              <div className="lg:block hidden border-b lg:ml-2 mt-2" />
            </>
          ) : null}

          <div className="lg:block hidden text-[11px] text-gray-500">
            <p className="pt-4 px-2">
              Công ty
            </p>
            <p className="pt-4 px-2">
              Chương trình
            </p>
            <p className="pt-4 px-2">
              Điều khoản và chính sách
            </p>
            <p className="pt-4 px-2">
              Thêm
            </p>
            <p className="pt-4 px-2">© 2025 TikTok</p>
          </div>

          <div className="pb-14"></div>
        </div>
      </div>
    </>
  );
}
