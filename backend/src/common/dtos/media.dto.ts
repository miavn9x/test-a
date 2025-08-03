import { IsNotEmpty, IsString } from 'class-validator';

export class MediaDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  mediaCode: string;
}
