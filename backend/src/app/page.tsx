"use client";
import Input from "./components/Forms/Input";
import Button from "@/app/components/button/Button";
import { FormProvider, useForm } from "react-hook-form";
import useLoginMutation from "./(auth)/login/hooks/useLoginMutation";
import { LoginRequest } from "@/types/login";
import withAuth from "@/app/components/hoc/withAuth";

export default withAuth(LoginPage, "public");
function LoginPage() {
  const methods = useForm<LoginRequest>({
    mode: "onChange",
  });

  const { handleSubmit } = methods;

  const { mutate: mutateLogin, isPending } = useLoginMutation();
  const onSubmit = (data: LoginRequest) => {
    mutateLogin(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col w-full max-w-md p-6 md:p-8 bg-white border rounded-lg shadow-lg space-y-6"
        >
          <div className="space-y-4 text-center">
            <h3 className="text-xl md:text-2xl font-semibold">
              Masuk dengan email atau ID Anda
            </h3>
            <p className="text-sm md:text-base text-gray-600">
              Masukkan email dan kata sandi yang telah terdaftar
            </p>
          </div>
          <Input
            type="email"
            id="email"
            label="Email atau ID Karyawan"
            placeholder="karyawan@gmail.com"
            validation={{ required: "Email harus diisi" }}
          />
          <Input
            type="password"
            id="password"
            label="Masukkan kata sandi"
            placeholder="Password"
            validation={{ required: "Password harus diisi" }}
          />
          <Button
            variant="primary"
            size="base"
            isLoading={isPending}
            type="submit"
            className="w-full"
          >
            Login
          </Button>
        </form>
      </FormProvider>
    </div>
  );
}
