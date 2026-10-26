import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!session || (session.user as { role?: string }).role !== "admin") {
    redirect("/admin/login?error=admin_required");
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AdminHeader userEmail={session.user.email} />
      {children}
    </div>
  );
}
