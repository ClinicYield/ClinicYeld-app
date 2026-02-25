import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SessionProvider>
            <div className="flex h-screen overflow-hidden" style={{ background: "#0f1117" }}>
                <Sidebar />
                <main className="flex-1 flex flex-col overflow-hidden ml-64">
                    <div className="flex-1 overflow-y-auto">
                        {children}
                    </div>
                </main>
            </div>
        </SessionProvider>
    );
}
