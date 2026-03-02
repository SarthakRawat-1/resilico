import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext<{
    value: string;
    onValueChange: (value: string) => void;
} | null>(null);

export function Tabs({
    value,
    onValueChange,
    children,
    className
}: {
    value: string;
    onValueChange: (val: string) => void;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <TabsContext.Provider value={{ value, onValueChange }}>
            <div className={cn("flex flex-col w-full", className)}>
                {children}
            </div>
        </TabsContext.Provider>
    )
}

export function TabsList({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("inline-flex items-center gap-2 p-2 bg-gray-100 rounded-2xl shadow-inner", className)}>
            {children}
        </div>
    )
}

export function TabsTrigger({ value, children, className }: { value: string, children: React.ReactNode, className?: string }) {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error("TabsTrigger must be used within Tabs");

    const isActive = context.value === value;

    return (
        <button
            onClick={() => context.onValueChange(value)}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap px-4 py-3 text-sm font-bold transition-all rounded-xl focus-visible:outline-none focus-[&:not(:focus-visible)]:outline-none",
                isActive
                    ? "bg-white text-secondary shadow-sm"
                    : "text-gray-400 hover:text-gray-500 hover:bg-white/50",
                className
            )}
        >
            {children}
        </button>
    )
}

export function TabsContent({ value, children, className }: { value: string, children: React.ReactNode, className?: string }) {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error("TabsContent must be used within Tabs");

    if (context.value !== value) return null;

    return (
        <div className={cn("mt-4", className)}>
            {children}
        </div>
    )
}
