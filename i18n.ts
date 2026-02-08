import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Can be imported from a shared config
export const locales = ['tr', 'en'] as const;
export const defaultLocale = 'tr' as const;

export default getRequestConfig(async ({ locale }) => {
    // Ensure locale is valid, fallback to default if undefined
    const validLocale = locale && locales.includes(locale as any) ? locale : defaultLocale;

    return {
        locale: validLocale,
        messages: (await import(`./messages/${validLocale}.json`)).default,
    };
});
