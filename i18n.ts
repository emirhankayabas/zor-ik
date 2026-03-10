import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';

// Can be imported from a shared config
export const locales = ['tr', 'en'] as const;
export const defaultLocale = 'tr' as const;

export default getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale;
    const locale = hasLocale(locales, requested) ? requested : defaultLocale;

    return {
        locale,
        messages: (await import(`./messages/${locale}.json`)).default,
    };
});
