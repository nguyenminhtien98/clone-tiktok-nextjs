import { useGeneralStore } from "../../stores/general";
import TextInput from "../TextInput";
import { useState } from "react";
import { ShowErrorObject } from "../../types";
import { useUser } from "../../context/user";
import { BiLoaderCircle } from "react-icons/bi";
import { useRouter } from "next/navigation";

export default function Register() {
  const { setIsLoginOpen } = useGeneralStore();

  const contextUser = useUser();
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [name, setName] = useState<string | "">("");
  const [email, setEmail] = useState<string | "">("");
  const [password, setPassword] = useState<string | "">("");
  const [confirmPassword, setConfirmPassword] = useState<string | "">("");
  const [error, setError] = useState<ShowErrorObject | null>(null);

  const showError = (type: string) => {
    if (error && Object.entries(error).length > 0 && error?.type == type) {
      return error.message;
    }
    return "";
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9]+@gmail\.com$/;
    return emailRegex.test(email);
  };

  const validate = () => {
    setError(null);
    let isError = false;
  
    if (!name) {
      setError({ type: "name", message: "Tên là bắt buộc" });
      isError = true;
    } 
    else if (!email) {
      setError({ type: "email", message: "Email là bắt buộc" });
      isError = true;
    } else if (!email.includes("@gmail.com")) {
      setError({ type: "email", message: "Email phải là địa chỉ Gmail kết thúc bằng @gmail.com" });
      isError = true;
    } else if (!validateEmail(email)) {
      setError({ type: "email", message: "Email chỉ được chứa chữ cái và số trước @gmail.com" });
      isError = true;
    } 
    else if (!password) {
      setError({ type: "password", message: "Mật khẩu là bắt buộc" });
      isError = true;
    } else if (password.length < 8) {
      setError({ type: "password", message: "Mật khẩu phải dài ít nhất 8 ký tự" });
      isError = true;
    } else if (!/[A-Z]/.test(password)) {
      setError({ type: "password", message: "Mật khẩu phải chứa ít nhất một chữ cái in hoa" });
      isError = true;
    } else if (!/[a-z]/.test(password)) {
      setError({ type: "password", message: "Mật khẩu phải chứa ít nhất một chữ cái thường" });
      isError = true;
    } else if (!/[0-9]/.test(password)) {
      setError({ type: "password", message: "Mật khẩu phải chứa ít nhất một số" });
      isError = true;
    } else if (!/[!@#$%^&*]/.test(password)) {
      setError({ type: "password", message: "Mật khẩu phải chứa ít nhất một ký tự đặc biệt (!@#$%^&*)" });
      isError = true;
    } else if (/\s/.test(password)) {
      setError({ type: "password", message: "Mật khẩu không được chứa khoảng trắng" });
      isError = true;
    } 
    else if (password !== confirmPassword) {
      setError({ type: "password", message: "Mật khẩu không khớp" });
      isError = true;
    }
  
    return isError;
  };

  const register = async () => {
    const isError = validate();
    if (isError) return;
    if (!contextUser) return;

    try {
      setLoading(true);
      await contextUser.register(name, email, password);
      setLoading(false);
      setIsLoginOpen(false);
      router.refresh();
    } catch (error) {
      console.log(error);
      setLoading(false);
      alert(error);
    }
  };

  return (
    <>
      <div>
        <h1 className="text-center text-[28px] mb-4 font-bold">Register</h1>

        <div className="px-6 pb-2">
          <TextInput
            string={name}
            placeholder="Name"
            onUpdate={setName}
            inputType="text"
            error={showError("name")}
          />
        </div>

        <div className="px-6 pb-2">
          <TextInput
            string={email}
            placeholder="Email address"
            onUpdate={setEmail}
            inputType="email"
            error={showError("email")}
          />
        </div>

        <div className="px-6 pb-2">
          <TextInput
            string={password}
            placeholder="Password"
            onUpdate={setPassword}
            inputType="password"
            error={showError("password")}
          />
        </div>

        <div className="px-6 pb-2">
          <TextInput
            string={confirmPassword}
            placeholder="Confirm Password"
            onUpdate={setConfirmPassword}
            inputType="password"
            error={showError("confirmPassword")}
          />
        </div>

        <div className="px-6 pb-2 mt-6">
          <button
            disabled={loading}
            onClick={() => register()}
            className={`
                            flex items-center justify-center w-full text-[17px] font-semibold text-white py-3 rounded-sm
                            ${
                              !name || !email || !password || !confirmPassword
                                ? "bg-gray-200"
                                : "bg-[#F02C56]"
                            }
                        `}
          >
            {loading ? (
              <BiLoaderCircle
                className="animate-spin"
                color="#ffffff"
                size={25}
              />
            ) : (
              "Register"
            )}
          </button>
        </div>
      </div>
    </>
  );
}
