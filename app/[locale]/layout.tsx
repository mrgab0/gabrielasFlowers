import Link from 'next/link';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import dynamic from 'next/dynamic';

const CookieConsent = dynamic(() => import("@/components/CookieConsent").then((m) => m.CookieConsent));
const PedidoFlotante = dynamic(() => import("@/components/shop/PedidoFlotante").then((m) => m.PedidoFlotante));
const ShoppingCartComponent = dynamic(() => import("@/components/shop/Cart/ShoppingCart").then((m) => m.ShoppingCartComponent));
const ChatbotModal = dynamic(() => import("@/components/shop/Chatbot/ChatbotModal").then((m) => m.ChatbotModal));
 
export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  let messages;
  try {
    messages = await getMessages({locale});
  } catch (error) {
    notFound();
  }
 
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>

        <PedidoFlotante />
        <ShoppingCartComponent />
        {children}
        <ChatbotModal />
        <CookieConsent />
    </NextIntlClientProvider>
  );
}
