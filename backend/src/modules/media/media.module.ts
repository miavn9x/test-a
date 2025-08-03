import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaController } from 'src/modules/media/controllers/media.controller';
import { MediaRepository } from 'src/modules/media/repositories/media.repository';
import { Media, MediaSchema } from 'src/modules/media/schemas/media.schema';
import { MediaService } from './services/media.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Media.name, schema: MediaSchema }])],
  controllers: [MediaController],
  providers: [MediaService, MediaRepository],
  exports: [MediaRepository],
})
export class MediaModule {}
