"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/ui/sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLandingPage = pathname === "/";

    return (
        <>
            {!isLandingPage && <Sidebar />}
            <main className={`${!isLandingPage ? "lg:ml-64 p-4 md:p-8" : ""} min-h-screen`}>
                {children}
            </main>
        </>
    );
}
