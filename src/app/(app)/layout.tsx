export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen brut-bg text-black font-sans">
      <main className="w-full">{children}</main>
    </div>
  );
}