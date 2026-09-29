import { checkAuth } from "@/utils";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

const routes = [
  "/auth/signin",
  "/auth/signup",
  "/",
  "/dashboard",
  "/manage-charging-stations",
  "/reservations",
];

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  if (!routes.includes(pathname)) {
    return NextResponse.next();
  }

  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  console.log("Access token", accessToken);
  
  const isAuthenticated = await checkAuth(accessToken);

  console.log("Authenticated", isAuthenticated, "Pathname", pathname);

  if (pathname === "/auth/signin" || pathname === "/auth/signup") {
    return isAuthenticated
      ? NextResponse.redirect(new URL("/", req.nextUrl.origin).toString())
      : NextResponse.next();
  }

  return isAuthenticated
    ? NextResponse.next()
    : NextResponse.redirect(
        new URL("/auth/signin", req.nextUrl.origin).toString(),
      );
}
