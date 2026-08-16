import Link from 'next/link';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import { CookieConsent } from "@/components/CookieConsent";
import { PedidoFlotante } from "@/components/shop/PedidoFlotante";
import { ShoppingCartComponent } from "@/components/shop/Cart/ShoppingCart";
 
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
        <header className="p-4 bg-white dark:bg-[#181922] shadow-sm border-b border-gray-100 dark:border-gray-800">
            <div className="container mx-auto">
                <Link href="/" className="inline-flex items-center gap-3 hover:opacity-90 transition-opacity">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md bg-white flex-shrink-0">
                        <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-full" />
                    </div>
                    <span className="text-xl font-serif font-black text-[#1A1C1C] dark:text-white tracking-tight">
                        Flowers <span className="text-[#FF97A4]">For You</span>
                    </span>
                </Link>
            </div>
        </header>
        <PedidoFlotante />
        <ShoppingCartComponent />
        {children}
        <CookieConsent />
    </NextIntlClientProvider>
  );
}
