import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

const adminSessionCookieName = "pros_admin_session";
const adminSessionMaxAge = 60 * 60 * 8;

type AdminSessionPayload = {
  email: string;
  exp: number;
  sub: string;
  v: 1;
};

export type AdminSessionUser = {
  email: string;
  id: string;
};

function getSigningSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
}

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(encodedPayload: string, secret: string) {
  return createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");
}

function verifySignature(
  encodedPayload: string,
  signature: string,
  secret: string,
) {
  const expectedSignature = signPayload(encodedPayload, secret);
  const received = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (received.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(received, expected);
}

export function setAdminSessionCookie(
  response: NextResponse,
  user: AdminSessionUser,
) {
  const secret = getSigningSecret();

  if (!secret) {
    return;
  }

  const payload: AdminSessionPayload = {
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + adminSessionMaxAge,
    sub: user.id,
    v: 1,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signPayload(encodedPayload, secret);

  response.cookies.set(adminSessionCookieName, `${encodedPayload}.${signature}`, {
    httpOnly: true,
    maxAge: adminSessionMaxAge,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(adminSessionCookieName, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function getAdminSessionUser(): Promise<AdminSessionUser | null> {
  const state = await getAdminSessionState();

  return state.user;
}

export async function getAdminSessionState(): Promise<{
  hasCookie: boolean;
  hasSecret: boolean;
  reason: string;
  user: AdminSessionUser | null;
}> {
  const secret = getSigningSecret();

  if (!secret) {
    return {
      hasCookie: false,
      hasSecret: false,
      reason: "missing signing secret",
      user: null,
    };
  }

  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(adminSessionCookieName)?.value;

  if (!cookieValue) {
    return {
      hasCookie: false,
      hasSecret: true,
      reason: "missing cookie",
      user: null,
    };
  }

  const [encodedPayload, signature] = cookieValue.split(".");

  if (!encodedPayload || !signature) {
    return {
      hasCookie: true,
      hasSecret: true,
      reason: "malformed cookie",
      user: null,
    };
  }

  if (!verifySignature(encodedPayload, signature, secret)) {
    return {
      hasCookie: true,
      hasSecret: true,
      reason: "invalid signature",
      user: null,
    };
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as Partial<
      AdminSessionPayload
    >;

    if (
      payload.v !== 1 ||
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp < Math.floor(Date.now() / 1000)
    ) {
      return {
        hasCookie: true,
        hasSecret: true,
        reason: "expired or invalid payload",
        user: null,
      };
    }

    return {
      hasCookie: true,
      hasSecret: true,
      reason: "valid",
      user: {
        email: payload.email,
        id: payload.sub,
      },
    };
  } catch {
    return {
      hasCookie: true,
      hasSecret: true,
      reason: "payload parse failed",
      user: null,
    };
  }
}
