import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

// next-intl middleware
const intlMiddleware = createMiddleware(routing);

// إعدادات
const ADMIN_PREFIX = '/admin';
const ADMIN_LOGIN_PATH = '/admin/login';

function getLocaleFromPath(pathname: string, locales: string[], def: string) {
  const seg = pathname.split('/').filter(Boolean)[0];
  return locales.includes(seg || '') ? seg! : def;
}

function stripLocalePrefix(pathname: string, locales: string[]) {
  const parts = pathname.split('/');
  if (parts.length > 1 && locales.includes(parts[1])) {
    return '/' + parts.slice(2).join('/');
  }
  return pathname;
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const locales = [...routing.locales];
  const defaultLocale = routing.defaultLocale;
  const locale = getLocaleFromPath(pathname, locales, defaultLocale);
  const pathWithoutLocale = stripLocalePrefix(pathname, locales);

  const isAdminLogin = pathWithoutLocale === ADMIN_LOGIN_PATH;
  const token = req.cookies.get('access_token')?.value ?? null;

  // لو داخل /admin/login وعنده توكن → ودّيه للوحة التحكم
  if (isAdminLogin && token) {
    const backTo = req.nextUrl.searchParams.get('from') || `/${locale}${ADMIN_PREFIX}`;
    const url = req.nextUrl.clone();
    url.pathname = backTo;
    url.search = '';
    return NextResponse.redirect(url);
  }

  // شغّل intl middleware للباقي
  return intlMiddleware(req);
}

// نفس الماتشر بتاعك
export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
