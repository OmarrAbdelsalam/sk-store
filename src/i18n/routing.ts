import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en'],
 
  // Used when no locale matches
  defaultLocale: 'en',

  // Don't show locale prefix in URLs (English only)
  localePrefix: 'never'
});