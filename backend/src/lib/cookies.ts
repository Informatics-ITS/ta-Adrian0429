import Cookies from "universal-cookie";

const cookies = new Cookies();

export const getToken = (): string => cookies.get("@bs/token");

export const setToken = (token: string) => {
  cookies.set("@bs/token", token, { path: "/" });
};

export const removeToken = () => cookies.remove("@bs/token", { path: "/" });
