import axios from "axios";
import { TransactionItem } from "@/types/transaksi";

const config = "http://localhost:5000";
export const selectedPrinter = "POS-80";

export const sendPrintJob = async (
  printer: string,
  items: TransactionItem[],
  metode_bayar: string,
  total_harga: number,
  diskon: number,
  nomor_nota: string
) => {
  const esc = "\x1B";
  const newLine = "\x0A";
  const separator = "--------------------------------";
  let cmds = esc + "@";

  cmds += "\x1B\x33\x00";
  cmds += esc + "!" + "\x38";
  cmds += "UD. BUMI SUBUR" + newLine;
  cmds += esc + "!" + "\x00";
  cmds += "JL Jenderal Ahmad Yani, Bugis, Tanjung" + newLine;
  cmds += "Redeb, Berau, 77312, Indonesia" + newLine;
  cmds += "055421126" + newLine;
  cmds += "\x1B\x32";

  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID");
  const timeStr = now.toLocaleTimeString("id-ID");

  cmds += `No. Nota   : ${nomor_nota}`+ newLine;
  cmds += `Tanggal    : ${dateStr} ${timeStr}` + newLine;
  // cmds += "Kasir      : Ai Dominic" + newLine + newLine;

  cmds += separator + newLine;

  items.forEach((item) => {
    cmds += `${item.nama_produk}` + newLine;
    cmds +=
      `${item.ukuran}-${item.warna}   ${
        item.jumlah
      } x ${item.harga.toLocaleString()}           ${item.subtotal.toLocaleString()}` +
      newLine;
  });

  cmds += separator + newLine;
  cmds += `${items.length} Items` + newLine;
  cmds += `Total Diskon: ${diskon}` + newLine;
  cmds += "Total                  " + total_harga.toLocaleString() + newLine;
  cmds += separator + newLine;
  cmds += "Pembayaran : " + metode_bayar + newLine;
  cmds += separator + newLine;
  cmds += newLine + "Terima kasih atas kunjungan Anda!" + newLine;
  cmds += newLine + newLine + "\x1D\x56\x42\x00";

  return await axios.post(`${config}/job`, {
    printer: printer,
    type: "RAW",
    data: cmds,
  });
};
