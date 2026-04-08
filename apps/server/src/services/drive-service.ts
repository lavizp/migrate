import { google } from "googleapis";
import { getAuthenticatedClient } from "./google-oauth-service";

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  createdTime: string;
  modifiedTime: string;
  parents: string[];
  webViewLink?: string;
  webContentLink?: string;
}

export interface FileListResult {
  files: DriveFile[];
  nextPageToken?: string;
}

export async function listFiles(
  userId: string,
  query?: string,
  pageSize: number = 20,
  pageToken?: string
): Promise<FileListResult> {
  const auth = await getAuthenticatedClient(userId);
  const drive = google.drive({ version: "v3", auth });

  let q = "trashed = false";
  if (query) {
    q += ` and (name contains '${query}' or '${query}' in parents)`;
  }

  const response = await drive.files.list({
    q,
    pageSize,
    pageToken,
    fields: "nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, parents, webViewLink, webContentLink)",
  });

  return {
    files: (response.data.files || []).map((f: any) => ({
      id: f.id || "",
      name: f.name || "",
      mimeType: f.mimeType || "",
      size: f.size || "",
      createdTime: f.createdTime || "",
      modifiedTime: f.modifiedTime || "",
      parents: f.parents || [],
      webViewLink: f.webViewLink || undefined,
      webContentLink: f.webContentLink || undefined,
    })),
    nextPageToken: response.data.nextPageToken || undefined,
  };
}

export async function getFile(
  userId: string,
  fileId: string
): Promise<DriveFile> {
  const auth = await getAuthenticatedClient(userId);
  const drive = google.drive({ version: "v3", auth });

  const response = await drive.files.get({
    fileId,
    fields: "id, name, mimeType, size, createdTime, modifiedTime, parents, webViewLink, webContentLink",
  });

  return {
    id: response.data.id || "",
    name: response.data.name || "",
    mimeType: response.data.mimeType || "",
    size: response.data.size || "",
    createdTime: response.data.createdTime || "",
    modifiedTime: response.data.modifiedTime || "",
    parents: response.data.parents || [],
    webViewLink: response.data.webViewLink || undefined,
    webContentLink: response.data.webContentLink || undefined,
  };
}

export async function uploadFile(
  userId: string,
  name: string,
  content: Buffer | string,
  mimeType: string,
  parentId?: string
): Promise<DriveFile> {
  const auth = await getAuthenticatedClient(userId);
  const drive = google.drive({ version: "v3", auth });

  const requestBody: any = {
    name,
    mimeType,
  };
  if (parentId) {
    requestBody.parents = [parentId];
  }

  const media = {
    mimeType,
    body: content instanceof Buffer ? content : Buffer.from(content),
  };

  const response = await drive.files.create({
    requestBody,
    media,
    fields: "id, name, mimeType, size, createdTime, modifiedTime, parents, webViewLink, webContentLink",
  });

  return {
    id: response.data.id || "",
    name: response.data.name || "",
    mimeType: response.data.mimeType || "",
    size: response.data.size || "",
    createdTime: response.data.createdTime || "",
    modifiedTime: response.data.modifiedTime || "",
    parents: response.data.parents || [],
    webViewLink: response.data.webViewLink || undefined,
    webContentLink: response.data.webContentLink || undefined,
  };
}

export async function downloadFile(
  userId: string,
  fileId: string
): Promise<Buffer> {
  const auth = await getAuthenticatedClient(userId);
  const drive = google.drive({ version: "v3", auth });

  const response = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "arraybuffer" }
  );

  return Buffer.from(response.data as ArrayBuffer);
}

export async function deleteFile(userId: string, fileId: string): Promise<void> {
  const auth = await getAuthenticatedClient(userId);
  const drive = google.drive({ version: "v3", auth });

  await drive.files.delete({ fileId });
}