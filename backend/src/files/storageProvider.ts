export type PutObjectInput = {
  objectKey: string;
  contentType: string;
  contentLength: number;
};

export type PutObjectSignedUrl = {
  url: string;
  method: 'PUT';
  headers: Record<string, string>;
};

export type GetObjectSignedUrl = {
  url: string;
  method: 'GET';
  headers: Record<string, string>;
};

export interface StorageProvider {
  getSignedUploadUrl(input: PutObjectInput): Promise<PutObjectSignedUrl>;
  getSignedDownloadUrl(input: { objectKey: string; fileName: string }): Promise<GetObjectSignedUrl>;
  deleteObject(input: { objectKey: string }): Promise<void>;
}

