"use client";
import { PrintReceipt } from "@/utils/printReceipt";
import { useIsMobile } from "@/utils/useIsMobile";
import Cookies from "universal-cookie";

const TestDataIdPrint = [
  {
    id: 202502030001,
  },
  {
    id: 202502030002,
  },
  {
    id: 202502040005,
  },
];

export default function Page() {
  const cookies = new Cookies();
  const token = cookies.get("@bs/token"); // Retrieve token from cookies

  const isMobile = useIsMobile();

  const handlePrintMobile = (id: any) => {
    if (!token) {
      alert("Token not found! Please log in.");
      return;
    }

    const printUrl = `my.bluetoothprint.scheme://https://bumisubur-fe.vercel.app/api/print/${id}?token=${token}`;
    const link = document.createElement("a");
    link.href = printUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {TestDataIdPrint.map((data) => (
        <div key={data.id}>
          <p>ID: {data.id}</p>
          {isMobile ? (
            <>
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-2"
                onClick={() => handlePrintMobile(data.id)}
              >
                Print Mobile
              </button>
            </>
          ) : (
            <>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => PrintReceipt(data.id)}
              >
                Print PC
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
