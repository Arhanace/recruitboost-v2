import { google } from "googleapis";

export function createGmailOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );
}

export function getGmailAuthUrl() {
  const oauth2Client = createGmailOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.readonly",
    ],
  });
}

export function createAuthenticatedGmailClient(
  accessToken: string,
  refreshToken?: string | null
) {
  const oauth2Client = createGmailOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken ?? undefined,
  });
  return { gmail: google.gmail({ version: "v1", auth: oauth2Client }), oauth2Client };
}

export function makeRawMessage(
  from: string,
  to: string,
  subject: string,
  body: string
): string {
  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    body,
  ].join("\r\n");

  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function makeRawReply(
  from: string,
  to: string,
  subject: string,
  body: string,
  messageId: string,
  threadId: string
): string {
  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `In-Reply-To: ${messageId}`,
    `References: ${messageId}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    body,
  ].join("\r\n");

  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function sendGmailMessage(
  accessToken: string,
  refreshToken: string | null,
  from: string,
  to: string,
  subject: string,
  body: string,
  threadId?: string,
  inReplyToMessageId?: string
) {
  const { gmail, oauth2Client } = createAuthenticatedGmailClient(accessToken, refreshToken);

  let newAccessToken: string | null = null;
  oauth2Client.on("tokens", (tokens) => {
    if (tokens.access_token) {
      newAccessToken = tokens.access_token;
    }
  });

  const raw =
    threadId && inReplyToMessageId
      ? makeRawReply(from, to, subject, body, inReplyToMessageId, threadId)
      : makeRawMessage(from, to, subject, body);

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw,
      threadId: threadId || undefined,
    },
  });

  return {
    messageId: response.data.id,
    threadId: response.data.threadId,
    newAccessToken,
  };
}

export async function getGmailMessages(
  accessToken: string,
  refreshToken: string | null,
  maxResults = 20
) {
  const { gmail } = createAuthenticatedGmailClient(accessToken, refreshToken);

  const response = await gmail.users.messages.list({
    userId: "me",
    maxResults,
  });

  return response.data.messages || [];
}

interface SyncedMessage {
  gmailMessageId: string;
  threadId: string | null;
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
}

function getHeader(
  headers: { name?: string | null; value?: string | null }[],
  name: string
): string {
  return headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || "";
}

function extractEmailAddress(headerValue: string): string {
  const match = headerValue.match(/<([^>]+)>/);
  return match ? match[1] : headerValue.trim();
}

function decodeBase64Url(data: string): string {
  const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64").toString("utf-8");
}

function extractPlainTextBody(payload: {
  mimeType?: string | null;
  body?: { data?: string | null } | null;
  parts?: Array<{
    mimeType?: string | null;
    body?: { data?: string | null } | null;
    parts?: Array<{
      mimeType?: string | null;
      body?: { data?: string | null } | null;
    }>;
  }>;
}): string {
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        return decodeBase64Url(part.body.data);
      }
      if (part.parts) {
        for (const subPart of part.parts) {
          if (subPart.mimeType === "text/plain" && subPart.body?.data) {
            return decodeBase64Url(subPart.body.data);
          }
        }
      }
    }
  }

  return "";
}

export async function syncGmailInbox(
  accessToken: string,
  refreshToken: string | null,
  maxResults = 20
): Promise<{ messages: SyncedMessage[]; newAccessToken: string | null }> {
  const { gmail, oauth2Client } = createAuthenticatedGmailClient(accessToken, refreshToken);

  let newAccessToken: string | null = null;
  oauth2Client.on("tokens", (tokens) => {
    if (tokens.access_token) {
      newAccessToken = tokens.access_token;
    }
  });

  const listResponse = await gmail.users.messages.list({
    userId: "me",
    maxResults,
    q: "in:inbox",
  });

  const messageRefs = listResponse.data.messages || [];
  const messages: SyncedMessage[] = [];

  for (const ref of messageRefs) {
    if (!ref.id) continue;

    const msg = await gmail.users.messages.get({
      userId: "me",
      id: ref.id,
      format: "full",
    });

    const headers = msg.data.payload?.headers || [];
    const from = getHeader(headers, "From");
    const subject = getHeader(headers, "Subject");
    const date = getHeader(headers, "Date");

    const body = msg.data.payload ? extractPlainTextBody(msg.data.payload) : "";

    messages.push({
      gmailMessageId: ref.id,
      threadId: msg.data.threadId || null,
      from: extractEmailAddress(from),
      subject,
      body: body.slice(0, 10000),
      receivedAt: date ? new Date(date).toISOString() : new Date().toISOString(),
    });
  }

  return { messages, newAccessToken };
}
