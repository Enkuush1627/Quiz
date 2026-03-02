import { UserButton } from "@clerk/nextjs";

export const Header = () => {
  return (
    <div className="fixed z-50 border-b bg-white flex h-14 px-6 justify-between items-center w-full">
      <h1 className="font-semibold text-2xl">Quiz App</h1>

      <UserButton />
    </div>
  );
};
