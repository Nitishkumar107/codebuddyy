// D:\vscodedata\codebuddy\app\page.tsx
// this is home page after login


import { Button } from "@/components/ui/button";
import UserButton from "@/features/auth/components/user-button";
import Image from "next/image";


export default function Home() {
  return (
    <div > 
      <h1 className="text-4x1 font-bold text-rose-500">this is home page after login</h1>
        <UserButton/>
    </div>
  
  );
}
