import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ConversationSidebar } from "@/components/chat/conversation-sidebar";
import { KeyboardShortcutsProvider } from "@/components/keyboard-shortcuts-provider";
import { DashboardHeader } from "@/components/dashboard-header";
import { isAdminEmail } from "@/lib/admin";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  if (!session.user.onboarded) {
    redirect("/onboarding");
  }

  const canAccessAdmin = isAdminEmail(session.user.email);

  return (
    <KeyboardShortcutsProvider>
      <div className="flex h-screen">
        <ConversationSidebar isAdmin={canAccessAdmin} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader
            userName={session.user.name}
            userEmail={session.user.email}
          />
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </div>
    </KeyboardShortcutsProvider>
  );
}
