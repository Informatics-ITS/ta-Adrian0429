import axios from "axios";
import Cookies from "universal-cookie";

const cookies = new Cookies();
const config = "http://localhost:5000";
export const selectedPrinter = "POS-80" as const;

interface DetailTransaksi {
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
  detail_transaksi: DetailTransaksi[];
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: TransactionData;
}

interface PrintJobPayload {
  printer: string;
  type: "RAW";
  data: string;
}

export const PrintReceipt = async (id_nota: string | number): Promise<void> => {
  try {

    const token = cookies.get("@bs/token");
    if (!token) {
      throw new Error("Authentication token not found");
    }
  
    const apiUrl = process.env.NEXT_PUBLIC_API_URL_DEV;
    const apiEndpoint = `${apiUrl}/api/transaksi/print/${id_nota}`;


    const response = await axios.get<ApiResponse>(
      apiEndpoint,
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.data.status) {
      throw new Error(response.data.message || 'Failed to fetch transaction data');
    }

    const transactionData = response.data.data;
    const items = transactionData.detail_transaksi;

    // Printer command constants
    const esc = "\x1B";
    const newLine = "\x0A";
    const separator = "--------------------------------";
    let cmds = esc + "@";

    // Initialize printer
    cmds += "\x1B\x33\x00";
    cmds += esc + "!" + "\x38";
    cmds += "UD. BUMI SUBUR" + newLine + newLine;
    cmds += esc + "!" + "\x00";
    cmds += "JL Jenderal Ahmad Yani, Bugis, Tanjung" + newLine;
    cmds += "Redeb, Berau, 77312, Indonesia" + newLine + newLine;
    // cmds += "055421126" + newLine;
    cmds += "\x1B\x32";

    // Format date and time
    const transactionDate = new Date(transactionData.tanggal_transaksi);
    const dateStr = transactionDate.toLocaleDateString("id-ID");
    const timeStr = transactionDate.toLocaleTimeString("id-ID");

    // Header information
    cmds += `No. Nota   : ${transactionData.id_transaksi}` + newLine;
    cmds += `Tanggal    : ${dateStr} ${timeStr}` + newLine;

    cmds += separator + newLine;

    // Items detail
    items.forEach((item, index) => {
      cmds += `${item.nama_produk} (${item.merk})` + newLine;
      const subtotal = item.jumlah_item * item.harga_produk;
      cmds +=
      `${item.ukuran} - ${item.jenis}   ${
        item.jumlah_item
      } x ${item.harga_produk.toLocaleString()}           ${
        subtotal.toLocaleString()
      }` + newLine;
      if (index < items.length - 1) {
      cmds += newLine;
      }
    });

    // Footer information
    cmds += separator + newLine;
    cmds += `${items.length} Items` + newLine;
    cmds += `Total Diskon: ${transactionData.diskon.toLocaleString()}` + newLine;
    cmds += "Total                  " + transactionData.total_harga.toLocaleString() + newLine;
    cmds += separator + newLine;
    cmds += "Pembayaran : " + transactionData.metode_bayar + newLine;
    cmds += separator + newLine;
    cmds += newLine + "Terima kasih atas kunjungan Anda!" + newLine;
    cmds += newLine + newLine + "\x1D\x56\x42\x00";

    const printJobPayload: PrintJobPayload = {
      printer: selectedPrinter,
      type: "RAW",
      data: cmds,
    };
    
    await axios.post(`${config}/job`, printJobPayload);
  } catch (error) {
    console.error('Error in sendMobilePrintJob:', error);
    throw error;
  }
};