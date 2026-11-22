import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

// PATCH: every field is optional, but a field that IS sent must still be valid.
export class UpdateGenreDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  slug?: string;
}
