import { google } from "googleapis";
import { getAuthenticatedClient } from "./google-oauth-service";

export interface EmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  snippet: string;
  body?: string;
  attachments?: AttachmentInfo[];
}

export interface AttachmentInfo {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
}

export async function listEmails(
  userId: string,
  query?: string,
  maxResults: number = 20
): Promise<EmailMessage[]> {
  const auth = await getAuthenticatedClient(userId);
  const gmail = google.gmail({ version: "v1", auth });

  const response = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults,
  });

  const messages = response.data.messages || [];

  const detailedMessages: EmailMessage[] = await Promise.all(
    messages.map(async (msg: any) => {
      const detail = await gmail.users.messages.get({
        userId: "me",
        id: msg.id || "",
      });

      const headers = detail.data.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find((h: any) => h.name?.toLowerCase() === name.toLowerCase())
          ?.value || "";

      return {
        id: detail.data.id || "",
        threadId: detail.data.threadId || "",
        subject: getHeader("Subject"),
        from: getHeader("From"),
        to: getHeader("To"),
        date: getHeader("Date"),
        snippet: detail.data.snippet || "",
      };
    })
  );

  return detailedMessages;
}

export async function getEmail(
  userId: string,
  messageId: string
): Promise<EmailMessage> {
  const auth = await getAuthenticatedClient(userId);
  const gmail = google.gmail({ version: "v1", auth });

  const response = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  const headers = response.data.payload?.headers || [];
  const getHeader = (name: string) =>
    headers.find((h: any) => h.name?.toLowerCase() === name.toLowerCase())?.value ||
    "";

  let body = "";
  const parts = response.data.payload?.parts || [];
  const textPart = parts.find(
    (p: any) => p.mimeType === "text/plain" || p.mimeType === "text/html"
  );
  if (textPart?.body?.data) {
    body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
  } else if (response.data.payload?.body?.data) {
    body = Buffer.from(response.data.payload.body.data, "base64").toString("utf-8");
  }

  const attachments: AttachmentInfo[] = [];
  for (const part of parts) {
    if (part.filename && part.body?.attachmentId) {
      attachments.push({
        id: part.body.attachmentId || "",
        filename: part.filename,
        mimeType: part.mimeType || "application/octet-stream",
        size: parseInt(String(part.body.size || 0), 10),
      });
    }
  }

  return {
    id: response.data.id || "",
    threadId: response.data.threadId || "",
    subject: getHeader("Subject"),
    from: getHeader("From"),
    to: getHeader("To"),
    date: getHeader("Date"),
    snippet: response.data.snippet || "",
    body,
    attachments,
  };
}

export async function sendEmail(
  userId: string,
  params: SendEmailParams
): Promise<string> {
  const auth = await getAuthenticatedClient(userId);
  const gmail = google.gmail({ version: "v1", auth });

  const messageParts: string[] = [
    `To: ${params.to}`,
    `Subject: ${params.subject}`,
  ];

  if (params.cc) {
    messageParts.push(`Cc: ${params.cc}`);
  }
  if (params.bcc) {
    messageParts.push(`Bcc: ${params.bcc}`);
  }
  messageParts.push("", params.body);

  const message = messageParts.join("\n");
  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const result = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });

  return result.data.id || "";
}