import fs from 'fs';
import path from 'path';

import type { StorageProvider, GetObjectSignedUrl, PutObjectInput, PutObjectSignedUrl } from './storageProvider';
import { signPayload } from './signedUrlService';

const DATA_DIR = path.join(process.cwd(), '.data', 'files');

function ensureDirForFile(filePath: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function objectPath(objectKey: string) {
  // Keep object keys slash-separated.
  return path.join(DATA_DIR, ...objectKey.split('/'));
}

export class LocalStorageProvider implements StorageProvider {
  async getSignedUploadUrl(input: PutObjectInput): Promise<PutObjectSignedUrl> {
    const expiresAt = Date.now() + 15 * 60 * 1000;
    const { payload, sig } = signPayload({ action: 'upload', objectKey: input.objectKey, expiresAt });

    const url = `/api/v1/files/upload?payload=${encodeURIComponent(payload)}&sig=${encodeURIComponent(sig)}`;
    return { url, method: 'PUT', headers: { 'content-type': input.contentType } };
  }

  async getSignedDownloadUrl(input: { objectKey: string; fileName: string }): Promise<GetObjectSignedUrl> {
    const expiresAt = Date.now() + 15 * 60 * 1000;
    const { payload, sig } = signPayload({ action: 'download', objectKey: input.objectKey, expiresAt });
    const url = `/api/v1/files/download?payload=${encodeURIComponent(payload)}&sig=${encodeURIComponent(sig)}&name=${encodeURIComponent(input.fileName)}`;
    return { url, method: 'GET', headers: {} };
  }

  async deleteObject(input: { objectKey: string }): Promise<void> {
    const p = objectPath(input.objectKey);
    if (fs.existsSync(p)) fs.rmSync(p, { force: true });
  }

  static writeObject(objectKey: string, bytes: Buffer) {
    const p = objectPath(objectKey);
    ensureDirForFile(p);
    fs.writeFileSync(p, bytes);
  }

  static readObject(objectKey: string) {
    const p = objectPath(objectKey);
    return fs.readFileSync(p);
  }
}

