import { Inject, Injectable } from '@nestjs/common';
import { FileMetadata } from 'src/common/interfaces/upload.interface';
import { MediaRepository } from 'src/modules/media/repositories/media.repository';
import { MediaExtensionEnum } from '../enums/media-extension.enum';
import { MediaMimeTypeEnum } from '../enums/media-mime-type.enum';
import { MediaStorageTypeEnum } from '../enums/media-storage-type.enum';
import { MediaUsageEnum } from '../enums/media-usage.enum';

/**
 * MediaService is responsible for handling media file operations such as uploading single or multiple media files.
 * It interacts with the MediaRepository to persist media metadata to the database.
 */
@Injectable()
export class MediaService {
  constructor(
    @Inject(MediaRepository)
    private readonly mediaRepository: MediaRepository,
  ) {}

  /**
   * Handles the upload process for a single media file.
   * It creates a new media record in the database using the provided metadata and usage type.
   *
   * @param metadata - An object containing metadata information about the uploaded file, including original name, slug, media code, URL, mime type, type, extension, dimensions, and size.
   * @param usage - Enum value indicating the intended usage of the media (e.g., avatar, banner, etc.).
   *
   * @returns A promise resolving to an object containing a success message, the created media record, and a null error code.
   *
   * @example
   * const result = await mediaService.handleSingleUpload(fileMetadata, MediaUsageEnum.AVATAR);
   */
  async handleSingleUpload(
    metadata: FileMetadata,
    usage: MediaUsageEnum,
  ): Promise<{ message: string; data: any; errorCode: null }> {
    // createdMedia holds the media record created in the database after saving the metadata.
    const createdMedia = await this.mediaRepository.create({
      originalName: metadata.originName,
      slug: metadata.slug,
      mediaCode: metadata.mediaCode,
      url: metadata.url,
      mimeType: metadata.mimeType as MediaMimeTypeEnum,
      type: metadata.type as 'image' | 'video',
      extension: metadata.extension as MediaExtensionEnum,
      width: metadata.width ?? null,
      height: metadata.height ?? null,
      size: metadata.size,
      usage,
      storageType: MediaStorageTypeEnum.LOCAL,
      isActive: true,
      isDeleted: false,
      deletedAt: null,
    });

    return {
      message: 'Upload thành công',
      data: createdMedia,
      errorCode: null,
    };
  }

  /**
   * Handles the upload process for multiple media files at once.
   * It maps the list of file metadata objects into create payloads and inserts them into the database in bulk.
   *
   * @param metadataList - An array of metadata objects, each representing a file to be uploaded.
   * @param usage - Enum value indicating the intended usage of the media files.
   *
   * @returns A promise resolving to an object containing a success message, an array of created media records, and a null error code.
   *
   * @example
   * const result = await mediaService.handleMultiUpload(listOfFileMetadata, MediaUsageEnum.GALLERY);
   */
  async handleMultiUpload(
    metadataList: FileMetadata[],
    usage: MediaUsageEnum,
  ): Promise<{ message: string; data: any[]; errorCode: null }> {
    // createPayloads is an array of objects prepared from the metadataList, each object formatted to match the media entity schema for bulk insertion.
    const createPayloads = metadataList.map(metadata => ({
      originalName: metadata.originName,
      slug: metadata.slug,
      mediaCode: metadata.mediaCode,
      url: metadata.url,
      mimeType: metadata.mimeType as MediaMimeTypeEnum,
      type: metadata.type as 'image' | 'video',
      extension: metadata.extension as MediaExtensionEnum,
      width: metadata.width ?? null,
      height: metadata.height ?? null,
      size: metadata.size,
      usage,
      storageType: MediaStorageTypeEnum.LOCAL,
      isActive: true,
      isDeleted: false,
      deletedAt: null,
    }));

    const createdMedias = await this.mediaRepository.insertMany(createPayloads);

    return {
      message: 'Upload nhiều file thành công',
      data: createdMedias,
      errorCode: null,
    };
  }

  /**
   * Tìm media theo mediaCode.
   * @param mediaCode - Mã định danh media.
   * @returns Media document hoặc null nếu không tồn tại.
   */
  async getByMediaCode(mediaCode: string) {
    return this.mediaRepository.findOne({ mediaCode });
  }

  /**
   * Xoá cứng media khỏi DB theo mediaCode.
   * @param mediaCode - Mã định danh media.
   */
  async hardDeleteByMediaCode(mediaCode: string): Promise<void> {
    await this.mediaRepository.deleteOne({ mediaCode });
  }
}
