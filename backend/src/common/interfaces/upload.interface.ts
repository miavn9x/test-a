export interface FileMetadata {
  mediaCode: string;
  originName: string;
  slug: string;
  type: string;
  mimeType: string;
  extension: string;
  size: number;
  width?: number | null;
  height?: number | null;
  url: string;
}

export interface GeneratedFileInfo {
  fullName: string;
  slug: string;
  extension: string;
  absolutePath: string;
  metadata: FileMetadata;
}

export interface ExtendedMulterFile extends Express.Multer.File {
  metadata?: FileMetadata;
}
