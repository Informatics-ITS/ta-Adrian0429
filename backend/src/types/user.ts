export type User = {
  id: number;
  nik: string;
  name: string;
  email: string;
  no_hp: string;
  role: string;
  tanggal_masuk: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  alamat: string;
};

export type WithToken = {
  token: string;
};
