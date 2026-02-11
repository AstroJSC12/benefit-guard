import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;

  if (!userEmail || !isAdminEmail(userEmail)) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-2">
          <h1 className="text-2xl font-semibold">403 Forbidden</h1>
          <p className="text-sm text-muted-foreground">
            You do not have permission to access the admin dashboard.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
