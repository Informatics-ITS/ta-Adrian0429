import { AiOutlineLoading } from "react-icons/ai";

export default function Loading() {
  return (
    <section className="h-screen flex justify-center items-center">
      <div className="text-5xl text-gray-600 animate-spin">
        <AiOutlineLoading />
      </div>
    </section>
  );
}
