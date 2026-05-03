import UserNav from "@/components/user/UserNav";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <UserNav />
      <main className="md:ml-60 pb-24 md:pb-8">
        <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
