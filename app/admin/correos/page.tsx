import { EmailCenterClient } from "@/components/admin/EmailCenterClient";
import { getEmailsAction, getEmailStatsAction } from "@/lib/actions/emails";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Centro de Correos & Webmail | Gabriela's Flowers Admin",
  description: "Bandeja de entrada, redactor de correos corporativos y seguimiento de mensajes de clientes.",
};

export default async function AdminCorreosPage() {
  const initialEmails = await getEmailsAction({ folder: "inbox" });
  const stats = await getEmailStatsAction();

  return (
    <div className="space-y-6">
      <EmailCenterClient
        initialMessages={initialEmails.success ? initialEmails.data || [] : []}
        initialTotal={initialEmails.success ? initialEmails.total || 0 : 0}
        initialUnread={stats.unreadInbox || 0}
        initialSentCount={stats.totalSent || 0}
        initialInboxCount={stats.totalInbox || 0}
      />
    </div>
  );
}
