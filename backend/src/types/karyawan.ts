export type KaryawanData = {
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

export type AddKaryawanData = {
  id: number;
  nik: string;
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  no_hp: string;
  role: string;
  tanggal_masuk: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  alamat: string;
};
