export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  role: string;
  token: string;
};
