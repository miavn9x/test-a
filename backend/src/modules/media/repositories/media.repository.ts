import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Media, MediaDocument } from 'src/modules/media/schemas/media.schema';

@Injectable()
export class MediaRepository {
  constructor(
    @InjectModel(Media.name)
    private readonly mediaModel: Model<MediaDocument>,
  ) {}

  async create(media: Partial<Media>): Promise<Media> {
    return this.mediaModel.create(media);
  }

  async insertMany(mediaList: Partial<Media>[]): Promise<Media[]> {
    return this.mediaModel.insertMany(mediaList).then(docs => docs.map(doc => doc.toObject()));
  }

  async findOne(condition: Partial<Media>): Promise<Media | null> {
    return this.mediaModel.findOne(condition).lean().exec();
  }

  async deleteOne(condition: Partial<Media>): Promise<void> {
    await this.mediaModel.deleteOne(condition).exec();
  }
}
