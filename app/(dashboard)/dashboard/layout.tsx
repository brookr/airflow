"use client";

import DashboardNav from "./nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden lg:flex lg:flex-col w-64 border-r">
        <DashboardNav />
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
