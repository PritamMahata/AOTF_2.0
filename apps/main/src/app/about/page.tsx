import { NormalAppHeader } from "@/components/navigation/app-header";
import React from "react";

const page = () => {
  return (
    <div>
      <NormalAppHeader />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">About Us</h1>
      </div>
    </div>
  );
};

export default page;
