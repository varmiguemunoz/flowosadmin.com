import { auth } from "@/auth";
import { AdminNavbar } from "@/components/admin/adminNavbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Resolved on the server so the navbar renders the real name on first paint.
  const session = await auth();

  return (
    <div className="flex min-h-dvh flex-col">
      <AdminNavbar
        user={{
          name: session?.user?.name,
          email: session?.user?.email,
        }}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-12">
        {children}
      </main>
    </div>
  );
}
