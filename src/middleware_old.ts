import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

    if (!isAdminRoute) return;

    const user = req.auth?.user;

    if (!user) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    if (user.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
    }
});

export const config = {
    matcher: ["/admin/:path*"],
};