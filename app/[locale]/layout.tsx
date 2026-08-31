import Link from 'next/link';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import { CookieConsent } from "@/components/CookieConsent";
import { PedidoFlotante } from "@/components/shop/PedidoFlotante";
import { ShoppingCartComponent } from "@/components/shop/Cart/ShoppingCart";
import { ChatbotModal } from "@/components/shop/Chatbot/ChatbotModal";
 
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
