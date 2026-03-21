import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get('preferred-locale')?.value || 'tr';

  // Only support tr and en for now, fallback to tr
  const supportedLocale = ['tr', 'en'].includes(locale) ? locale : 'tr';

  return {
    locale: supportedLocale,
    messages: (await import(`../messages/${supportedLocale}.json`)).default,
  };
});
