import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
    // A list of all locales that are supported
    locales,

    // Used when no locale matches
    defaultLocale,

    // Never show locale prefix in URLs
    localePrefix: 'never'
});

export const config = {
    // Match all pathnames except for static files and API routes
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
