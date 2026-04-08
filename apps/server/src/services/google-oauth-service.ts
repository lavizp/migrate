import { google } from "googleapis";
import { db, credentials, type Credential } from "@migrate/db";
import { eq, and } from "drizzle-orm";
import { env } from "@migrate/env/server";
import { encrypt, decrypt } from "./crypto-service";

type OAuth2Client = any;

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/drive.file",
];

export function getOAuth2Client(): OAuth2Client {
  return new (google as any).auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI
  );
}

export function getAuthUrl(state?: string): string {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    state,
  });
}

export interface TokenResult {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export async function exchangeCode(code: string): Promise<TokenResult> {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  return {
    accessToken: tokens.access_token || "",
    refreshToken: tokens.refresh_token || undefined,
    expiresAt: tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : undefined,
  };
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<TokenResult> {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const { credentials: newCreds } = await oauth2Client.refreshAccessToken();

  return {
    accessToken: newCreds.access_token || "",
    refreshToken: newCreds.refresh_token || refreshToken,
    expiresAt: newCreds.expiry_date
      ? new Date(newCreds.expiry_date)
      : undefined,
  };
}

export async function saveCredentials(
  userId: string,
  tokens: TokenResult
): Promise<Credential> {
  const existing = await db
    .select()
    .from(credentials)
    .where(and(eq(credentials.userId, userId), eq(credentials.provider, "google")));

  const credValues = {
    userId,
    provider: "google",
    accessToken: encrypt(tokens.accessToken),
    refreshToken: tokens.refreshToken ? encrypt(tokens.refreshToken) : null,
    expiresAt: tokens.expiresAt || null,
  };

  if (existing.length > 0 && existing[0]) {
    const result = await db
      .update(credentials)
      .set({ ...credValues, updatedAt: new Date() })
      .where(eq(credentials.id, existing[0].id))
      .returning();
    const updated = result[0];
    if (!updated) {
      throw new Error("Failed to update credentials");
    }
    return updated;
  }

  const result = await db.insert(credentials).values(credValues).returning();
  const created = result[0];
  if (!created) {
    throw new Error("Failed to create credentials");
  }
  return created;
}

export async function getCredentials(userId: string): Promise<Credential | null> {
  const result = await db
    .select()
    .from(credentials)
    .where(and(eq(credentials.userId, userId), eq(credentials.provider, "google")));

  const cred = result[0];
  if (!cred) return null;

  const isExpired = cred.expiresAt && cred.expiresAt.getTime() < Date.now();

  if (isExpired && cred.refreshToken) {
    const decryptedRefresh = decrypt(cred.refreshToken);
    const newTokens = await refreshAccessToken(decryptedRefresh);
    return saveCredentials(userId, newTokens);
  }

  return cred;
}

export async function getAuthenticatedClient(
  userId: string
): Promise<OAuth2Client> {
  const cred = await getCredentials(userId);
  if (!cred) {
    throw new Error("No credentials found for user");
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: decrypt(cred.accessToken),
    refresh_token: cred.refreshToken ? decrypt(cred.refreshToken) : undefined,
  });

  return oauth2Client;
}

export async function revokeCredentials(userId: string): Promise<void> {
  const cred = await getCredentials(userId);
  if (cred) {
    try {
      const oauth2Client = getOAuth2Client();
      oauth2Client.setCredentials({
        access_token: decrypt(cred.accessToken),
      });
      await oauth2Client.revokeCredentials();
    } catch {
      // Ignore errors during revocation
    }

    await db.delete(credentials).where(eq(credentials.id, cred.id));
  }
}