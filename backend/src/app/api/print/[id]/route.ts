import { NextRequest } from "next/server";
import axios from "axios";
import Cookies from "universal-cookie";

const cookies = new Cookies();
interface TransactionDetail {
  detail_transaksi_id: number;
  detail_produk_id: number;
  merk: string;
  nama_produk: string;
  jenis: string;
  ukuran: string;
  jumlah_item: number;
  harga_produk: number;
}

interface TransactionData {
  id_transaksi: number;
  tanggal_transaksi: string;
  total_harga: number;
  metode_bayar: string;
  diskon: number;
  detail_transaksi: TransactionDetail[];
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: TransactionData;
}

// Define TypeScript types for receipt item
interface ReceiptItem {
  align: number;
  bold: number;
  content: string;
  format: number;
  type: number;
}

// Function to transform API response into formatted JSON
function formatReceipt(apiResponse: ApiResponse): Record<string, ReceiptItem> {
  if (!apiResponse.status || !apiResponse.data) {
    throw new Error("Invalid API response structure");
  }

  const data = apiResponse.data;
  const receipt: Record<string, ReceiptItem> = {};
  let index = 0;

  receipt[index++] = { align: 1, bold: 0, content: "UD. BUMI SUBUR", format: 1, type: 0 };
  receipt[index++] = { align: 1, bold: 0, content: "Jl. Jenderal Ahmad Yani, Bugis, Tanjung Redeb,\nBerau, 77312, Indonesia", format: 4, type: 0 };
  receipt[index++] = { align: 0, bold: 0, content: `No. Nota    : ${data.id_transaksi}`, format: 4, type: 0 };
  receipt[index++] = { align: 0, bold: 0, content: `tanggal     : ${new Date(data.tanggal_transaksi).toLocaleString()}`, format: 4, type: 0 };
  receipt[index++] = { align: 1, bold: 0, content: "---------------------------------------", format: 0, type: 0 };

  data.detail_transaksi.forEach((item) => {
    receipt[index++] = { align: 0, bold: 0, content: `${item.merk} - ${item.nama_produk}`, format: 0, type: 0 };
    receipt[index++] = {
      align: 0,
      bold: 0,
      content: `${item.ukuran} | ${item.jumlah_item} pcs | ${item.harga_produk} = ${item.jumlah_item * item.harga_produk}`,
      format: 0,
      type: 0,
    };
  });

  receipt[index++] = { align: 1, bold: 0, content: "---------------------------------------", format: 0, type: 0 };
  receipt[index++] = { align: 0, bold: 0, content: `${data.detail_transaksi.length} item`, format: 4, type: 0 };
  receipt[index++] = { align: 0, bold: 0, content: `Diskon: ${data.diskon}`, format: 4, type: 0 };
  receipt[index++] = { align: 0, bold: 1, content: `Total ${data.total_harga - data.diskon}`, format: 0, type: 0 };
  receipt[index++] = { align: 1, bold: 0, content: "Terima Kasih Atas Kunjungan Anda", format: 1, type: 0 };

  return receipt;
}

export async function GET(request: NextRequest) {
  try {
    
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();
    const token = url.searchParams.get("token");

    if (!id) {
      return new Response(JSON.stringify({ error: "Missing ID parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing token parameter" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL_DEV;
    const apiEndpoint = `${apiUrl}/api/transaksi/print/${id}`;

    const response = await axios.get<ApiResponse>(
      apiEndpoint,
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const formattedData = formatReceipt(response.data);

    return new Response(JSON.stringify(formattedData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
