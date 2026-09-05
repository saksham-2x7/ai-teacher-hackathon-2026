import Sidebar from "@/components/navigation/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-hexagon-bg text-hexagon-text-primary">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        {children}
      </main>
    </div>
  );
}
