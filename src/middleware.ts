import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieSet = { name: string; value: string; options?: CookieOptions };

const PUBLIC_ROUTES = ["/login", "/auth/callback"];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Env guard — if Supabase isn't configured yet, let public routes through
  // and 503 on protected routes (better than a 500 on every request).
  // See [[feedback_supabase_middleware_env_guard]].
  if (!url || !anon) {
    if (PUBLIC_ROUTES.some((p) => request.nextUrl.pathname.startsWith(p))) {
      return response;
    }
    return new NextResponse("Supabase not configured", { status: 503 });
  }

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(toSet: CookieSet[]) {
        for (const { name, value, options } of toSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = PUBLIC_ROUTES.some((p) => request.nextUrl.pathname.startsWith(p));
  if (!user && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
