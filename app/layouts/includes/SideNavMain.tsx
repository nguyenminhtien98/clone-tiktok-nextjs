import Link from "next/link";
import { usePathname } from "next/navigation";
import MenuItem from "./MenuItem";
import MenuItemFollow from "./MenuItemFollow";
import ClientOnly from "@/app/components/ClientOnly";

export default function SideNavMain() {
  const pathName = usePathname();

  return (
    <>
      <div
        id="SideNavMain"
        className={`fixed z-20 bg-white pt-[70px] h-full lg:border-r-0 border-r w-[75px] overflow-auto ${
          pathName === "/" ? "lg:w-[310px]" : "lg:w-[220px]"
        }`}
      >
        <div className="lg:w-full w-[55px] mx-auto">
          <Link href="/">
            <MenuItem
              iconString="Dành cho bạn"
              colorString={pathName === "/" ? "#F02C56" : ""}
              sizeString="25"
            />
          </Link>
          <MenuItem
            iconString="Đang Follow"
            colorString="#000000"
            sizeString="25"
          />
          <MenuItem iconString="LIVE" colorString="#000000" sizeString="25" />
          <div className="border-b lg:ml-2 mt-2" />
          <h3 className="lg:block hidden text-xs text-gray-600 font-semibold pt-4 pb-2 px-2">Suggested accounts</h3>
          <div className="lg:hidden block pt-3" />
          <ClientOnly>
            <MenuItemFollow
              user={{
                id: "1",
                name: "Test User",
                image: "https://placehold.co/50",
              }}
            />
          </ClientOnly>
          <button className="lg:block hidden text-[#F02C56] pt-1.5 pl-2 text-[13px]">
            See all
          </button>
          {true ? (
            <div>
              <div className="border-b lg:ml-2 mt-2" />
              <h3 className="lg:block hidden text-xs text-gray-600 font-semibold pt-4 pb-2 px-2">Following accounts</h3>
              <div className="lg:hidden block pt-3" />
              <ClientOnly>
                <MenuItemFollow
                  user={{
                    id: "1",
                    name: "Test User",
                    image: "https://placehold.co/50",
                  }}
                />
              </ClientOnly>
              <button className="lg:block hidden text-[#F02C56] pt-1.5 pl-2 text-[13px]">
                See more
              </button>
            </div>
          ) : null}
          <div className="lg:block hidden border-b lg:ml-2 mt-2" />
          <div className="lg:block hidden text-[11px] text-gray-500">
            <p className="pt-4 px-2 cursor-pointer">Công ty</p>
            <p className="pt-4 px-2 cursor-pointer">Chương trình</p>
            <p className="pt-4 px-2 cursor-pointer">Điều khoản chính sách</p>
            <p className="pt-4 px-2 cursor-pointer">Thêm</p>
            <p className="pt-4 px-2">@ 2025 TikTok</p>
          </div>
        </div>
      </div>
    </>
  );
}
