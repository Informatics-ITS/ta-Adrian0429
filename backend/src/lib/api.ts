import axios, { AxiosError } from "axios";
import { GetServerSidePropsContext } from "next/types";
import { UninterceptedApiError } from "@/types/api";
const context = <GetServerSidePropsContext>{};
import Cookies from "universal-cookie";
import { getToken } from "./cookies";

export const baseURL = process.env.NEXT_PUBLIC_API_URL_DEV;

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },

  withCredentials: false,
});

api.defaults.withCredentials = false;
const isBrowser = typeof window !== "undefined";

api.interceptors.request.use(function (config) {
  if (config.headers) {
    let token: string | undefined;

    if (!isBrowser) {
      if (!context)
        throw "Api Context not found. You must call `setApiContext(context)` before calling api on server-side";

      const cookies = new Cookies(context.req?.headers.cookie);
      token = cookies.get("/token");
    } else {
      token = getToken();
    }

    config.headers.Authorization = token ? `Bearer ${token}` : "";
  }

  return config;
});

api.interceptors.response.use(
  (config) => {
    return config;
  },
  (error: AxiosError<UninterceptedApiError>) => {
    // parse error
    if (error.response?.data.message) {
      return Promise.reject({
        ...error,
        response: {
          ...error.response,
          data: {
            ...error.response.data,
            message:
              typeof error.response.data.message === "string"
                ? error.response.data.message
                : Object.values(error.response.data.message)[0][0],
          },
        },
      });
    }
    return Promise.reject(error);
  }
);
export default api;
