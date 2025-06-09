"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MenuItem from "./MenuItem";
import MenuItemFollow from "./MenuItemFollow";
import { useEffect, useState, useRef } from "react";
import { useUser } from "../../context/user";
import ClientOnly from "../../components/ClientOnly";
import NotificationsPanel from "../../components/NotificationsPanel";
import { FollowingUser } from "../../types";
import getRandomUsers from "@/app/hooks/useGetRandomUsers";

export default function SideNavMain() {
  const { user, getFollowingList } = useUser();
  const [randomUsers, setRandomUsers] = useState<FollowingUser[]>([]);
  const [followingList, setFollowingList] = useState<FollowingUser[]>([]);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    getRandomUsers(user ? user.id : null, 5).then(setRandomUsers);
  }, [user]);

  useEffect(() => {
    if (user) {
      getFollowingList()
        .then(setFollowingList)
        .catch(() => setFollowingList([]));
    } else {
      setFollowingList([]);
    }
  }, [user, getFollowingList]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        isActivityOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(e.target as Node)
      ) {
        setIsActivityOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isActivityOpen]);

  return (
    <div
      id="SideNavMain"
      className={`
        fixed z-20 bg-white pt-[70px] h-full overflow-hidden
        ${pathname === "/" ? "lg:pl-0" : ""}
        w-[75px] lg:w-[310px]
        transition-all duration-200 ease-in-out
      `}
    >
      <div
        className={`
          scrollbar-hide h-full overflow-auto transition-opacity duration-200 ease-in-out
          ${isActivityOpen ? "opacity-0 pointer-events-none" : "opacity-100"}
        `}
      >
        <div className="lg:w-full w-[55px] mx-auto">
          <Link href="/">
            <MenuItem
              iconString="Dành cho bạn"
              colorString={pathname === "/" ? "#F02C56" : "#000"}
              sizeString="25"
            />
          </Link>
          {user && (
            <Link href="/followed">
              <MenuItem
                iconString="Following"
                colorString={pathname === "/followed" ? "#F02C56" : "#000"}
                sizeString="25"
              />
            </Link>
          )}
          {user && (
            <div onClick={() => setIsActivityOpen(true)} className="cursor-pointer">
              {!isActivityOpen && (
                <MenuItem
                  iconString="Thông báo"
                  colorString="#000"
                  sizeString="25"
                />
              )}
            </div>
          )}
          <MenuItem iconString="LIVE" colorString="#000" sizeString="25" />
          <div className="border-b lg:ml-2 mt-2" />

          {randomUsers.length > 0 && (
            <>
              <h3 className="lg:block hidden text-xs text-gray-600 font-semibold pt-4 pb-2 px-2">
                Tài khoản đề xuất
              </h3>
              <ClientOnly>
                <div className="cursor-pointer">
                  {randomUsers.map((u, i) => (
                    <MenuItemFollow key={i} user={u} />
                  ))}
                </div>
              </ClientOnly>
              <button className="lg:block hidden text-[#F02C56] pl-2 text-[13px]">
                See all
              </button>
              <div className="lg:block hidden border-b lg:ml-2 mt-2" />
            </>
          )}

          {followingList.length > 0 && (
            <>
              <h3 className="lg:block hidden text-xs text-gray-600 font-semibold pt-4 pb-2 px-2">
                Các tài khoản đã follow
              </h3>
              <ClientOnly>
                <div className="cursor-pointer">
                  {followingList.map((f, i) => (
                    <MenuItemFollow key={i} user={f} />
                  ))}
                </div>
              </ClientOnly>
              <button className="lg:block hidden text-[#F02C56] pl-2 text-[13px]">
                See more
              </button>
              <div className="lg:block hidden border-b lg:ml-2 mt-2" />
            </>
          )}

          <div className="lg:block hidden text-[11px] text-gray-500">
            <p className="pt-4 px-2">Công ty</p>
            <p className="pt-4 px-2">Chương trình</p>
            <p className="pt-4 px-2">Điều khoản và chính sách</p>
            <p className="pt-4 px-2">Thêm</p>
            <p className="pt-4 px-2">© 2025 TikTok</p>
          </div>
          <div className="pb-14"></div>
        </div>
      </div>

      {user && (
        <div ref={drawerRef}>
          <NotificationsPanel
            isOpen={isActivityOpen}
            onClose={() => setIsActivityOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
