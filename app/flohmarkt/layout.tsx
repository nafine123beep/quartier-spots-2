"use client";

import { ReactNode } from "react";
import { FlohmarktProvider } from "./FlohmarktContext";

export default function FlohmarktLayout({ children }: { children: ReactNode }) {
  return (
    <FlohmarktProvider>
      <div className="h-screen w-full overflow-hidden">
        {children}
      </div>
    </FlohmarktProvider>
  );
}
