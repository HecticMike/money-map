import type { Expense } from '../types';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

export interface DrivePayload {
  expenses: Expense[];
  syncedAt: string;
  version: number;
}

export interface UploadResult {
  fileId: string;
  modifiedTime?: string;
}

interface EnsureFileParams {
  accessToken: string;
  fileId?: string | null;
  fileName: string;
}

interface UploadParams {
  accessToken: string;
  fileId?: string | null;
  payload: DrivePayload;
}

interface DownloadParams {
  accessToken: string;
  fileId: string;
}

const request = async (
  url: string,
  accessToken: string,
  init: RequestInit = {}
): Promise<Response> => {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init.headers ?? {})
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google Drive request failed (${response.status}): ${body}`);
  }

  return response;
};

export const ensureDriveFile = async ({
  accessToken,
  fileId,
  fileName
}: EnsureFileParams): Promise<string> => {
  if (fileId != null) {
    return fileId;
  }

  const query = encodeURIComponent(`name = '${fileName}' and trashed = false`);
  const searchResponse = await request(
    `${DRIVE_API_BASE}/files?q=${query}&fields=files(id,name,modifiedTime)&spaces=drive`,
    accessToken
  );
  const searchData = (await searchResponse.json()) as { files?: Array<{ id: string }> };
  if (searchData.files != null && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  const createResponse = await request(
    `${DRIVE_API_BASE}/files`,
    accessToken,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      },
      body: JSON.stringify({
        name: fileName,
        mimeType: 'application/json'
      })
    }
  );
  const created = (await createResponse.json()) as { id: string };
  return created.id;
};

export const uploadExpensesToDrive = async ({
  accessToken,
  fileId,
  payload
}: UploadParams): Promise<UploadResult> => {
  const ensuredFileId = await ensureDriveFile({
    accessToken,
    fileId,
    fileName: 'money-map-data.json'
  });

  const boundary = `money-map-${Date.now()}`;
  const metadata = {
    name: 'money-map-data.json',
    mimeType: 'application/json'
  };

  const bodyParts = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Type: application/json',
    '',
    JSON.stringify(payload),
    `--${boundary}--`,
    ''
  ];

  const uploadResponse = await request(
    `${DRIVE_UPLOAD_BASE}/files/${ensuredFileId}?uploadType=multipart`,
    accessToken,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: bodyParts.join('\r\n')
    }
  );

  const uploaded = (await uploadResponse.json()) as { id: string; modifiedTime?: string };
  return {
    fileId: uploaded.id,
    modifiedTime: uploaded.modifiedTime
  };
};

export const downloadExpensesFromDrive = async ({
  accessToken,
  fileId
}: DownloadParams): Promise<DrivePayload> => {
  const response = await request(
    `${DRIVE_API_BASE}/files/${fileId}?alt=media`,
    accessToken
  );
  const data = (await response.json()) as Partial<DrivePayload>;
  if (data.expenses == null) {
    throw new Error('Drive backup is missing expenses data.');
  }
  return {
    expenses: data.expenses,
    syncedAt: data.syncedAt ?? new Date().toISOString(),
    version: data.version ?? 1
  };
};
