import { IsNotEmpty } from 'class-validator';

export class CreateChapterDto {
  @IsNotEmpty({ message: 'name of chapter must not be empty' })
  name: string;
  @IsNotEmpty({ message: 'description of chapter must not be empty' })
  description: string;
}
