import { AiOutlineClose } from "react-icons/ai";
import { useGeneralStore } from "@/app/stores/general";
import Login from "../components/auth/Login";
import Register from "@/app/components/auth/Register";
import { useState } from "react";

export default function AuthOverlay() {
  const { setIsLoginOpen } = useGeneralStore();

  const [isRegister, setIsRegister] = useState<boolean>(false);

  return (
    <>
      <div
        id="AuthOverlay"
        className="fixed flex items-center justify-center z-50 top-0 left-0 w-full h-full bg-black bg-opacity-50"
      >
        <div className="relative bg-white w-full max-w-[470px] p-4 rounded-lg">
          <div className="w-full flex justify-end">
            <button
              onClick={() => setIsLoginOpen(false)}
              className="p-1.5 rounded-full bg-gray-100"
            >
              <AiOutlineClose size="26" />
            </button>
          </div>

          {isRegister ? <Register /> : <Login />}

          <div className="flex items-center justify-center py-5 w-full">
            <span className="text-[14px] text-gray-600">
              Don’t have an account?
            </span>

            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-[14px] text-[#F02C56] font-semibold pl-1"
            >
              <span>{!isRegister ? "Register" : "log in"}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
