import { useMutation } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { ApiError } from "next/dist/server/api-utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { setToken } from "@/lib/cookies";
import { ApiResponse } from "@/types/api";
import { LoginRequest, LoginResponse } from "@/types/login";
import { User } from "@/types/user";
import useAuthStore from "@/stores/useAuthStore";

export default function useLoginMutation() {
  const { login } = useAuthStore();

  const router = useRouter();

  const { mutate, isPending } = useMutation<
    AxiosResponse,
    AxiosError<ApiError>,
    LoginRequest
  >({
    mutationFn: async (data: LoginRequest) => {
      const res = await api.post<ApiResponse<LoginResponse>>(
        "/api/user/login",
        data,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      console.log("res login", res);
      const { token } = res.data.data;
      setToken(token);

      const user = await api.get<ApiResponse<User>>("/api/user/me", {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });

      console.log("res get me", user);

      if (user) login({ ...user.data.data, token: token });

      return res;
    },
    onSuccess: () => {
      toast.success("Anda berhasil login");
      router.push("/");
    },
    onError: (error) => {
      toast.error(
        error.response?.data.message ||
          "Email atau kata sandi salah, silahkan coba lagi"
      );
    },
  });
  return { mutate, isPending };
}
