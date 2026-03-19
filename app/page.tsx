import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="bg-gray-300 h-screen w-full flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg flex justify-center items-center flex-cols inline-block">
          <Image src="/next.svg" alt="avatar" width={100} height={100} />
          <div>許兆豐</div>
          <div>Nick Hsu</div>
          
        </div>
      </div>
    </>
  );
}
