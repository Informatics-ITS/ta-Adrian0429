import Cookies from "universal-cookie";

const cookies = new Cookies();
const token = cookies.get("@bs/token"); // Retrieve token from cookies

export const handlePrintMobile = (id: any) => {
  try {
    if (!token) {
      throw new Error("Token not found! Please log in.");
    }

    const printUrl = `my.bluetoothprint.scheme://https://bumisubur-fe.vercel.app/api/print/${id}?token=${token}`;
    const link = document.createElement("a");

    link.href = printUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Printing failed:", error);
    throw error;
  }
};
