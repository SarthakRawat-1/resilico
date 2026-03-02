"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Network,
    Activity,
    Play,
    FlaskConical,
    FileText,
    Database,
    Menu,
    X,
    HelpCircle,
    Trash2,
    Loader2,
} from "lucide-react";
import { useTutorial } from "@/hooks/useTutorial";
import { cfssApi } from "@/lib/api";
import Image from "next/image";

export const NAV_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/data", label: "Data Hub", icon: Database },
    { href: "/network", label: "Network", icon: Network },
    { href: "/simulation", label: "Simulation", icon: Play },
    { href: "/stress-test", label: "Stress Test", icon: FlaskConical },
    { href: "/reports", label: "Reports", icon: FileText },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const { startTutorial } = useTutorial();
    const [confirmReset, setConfirmReset] = React.useState(false);
    const [resetting, setResetting] = React.useState(false);

    const handleResetCommunity = async () => {
        if (!confirmReset) {
            setConfirmReset(true);
            setTimeout(() => setConfirmReset(false), 3000);
            return;
        }
        setResetting(true);
        try {
            await cfssApi.deleteCommunity();
            setOpen(false);
            router.push("/dashboard");
            router.refresh();
        } catch (err) {
            console.error("Failed to reset community", err);
        } finally {
            setResetting(false);
            setConfirmReset(false);
        }
    };

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={() => setOpen(!open)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-surface border-2 border-gray-200 text-gray-500 btn-3d"
            >
                {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Overlay on mobile */}
            {open && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/20 z-30"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-40 h-screen w-64 flex flex-col bg-white border-r-2 border-gray-200 transition-transform duration-300",
                    open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Logo */}
                <div className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/logo.png"
                            alt="Resilico Logo"
                            width={40}
                            height={40}
                            className="rounded-xl shadow-sm border-2 border-indigo-100"
                        />
                        <div>
                            <h1 className="text-2xl font-extrabold text-indigo-900 tracking-tight">Resilico</h1>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-3 overflow-y-auto mt-4">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-lg transition-all",
                                    isActive
                                        ? "bg-secondary/10 text-secondary border-2 border-secondary/20"
                                        : "text-gray-400 border-2 border-transparent hover:bg-gray-100 hover:text-gray-500"
                                )}
                            >
                                <item.icon className={cn("w-6 h-6 shrink-0", isActive ? "text-secondary" : "text-gray-400")} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Actions */}
                <div className="px-4 mt-2 mb-4 space-y-2">
                    <button
                        onClick={() => {
                            setOpen(false);
                            startTutorial(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all text-secondary-dark bg-secondary/10 border-2 border-secondary/20 hover:bg-secondary/20"
                    >
                        <HelpCircle className="w-5 h-5 shrink-0" />
                        Replay Tutorial
                    </button>
                    <button
                        onClick={handleResetCommunity}
                        disabled={resetting}
                        className={cn(
                            "w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all border-2",
                            confirmReset
                                ? "text-white bg-danger border-danger/80 hover:bg-danger/90"
                                : "text-danger bg-danger/10 border-danger/20 hover:bg-danger/20"
                        )}
                    >
                        {resetting ? (
                            <Loader2 className="w-5 h-5 shrink-0 animate-spin" />
                        ) : (
                            <Trash2 className="w-5 h-5 shrink-0" />
                        )}
                        {confirmReset ? "CONFIRM RESET?" : "Reset Community"}
                    </button>
                </div>
            </aside>
        </>
    );
}
