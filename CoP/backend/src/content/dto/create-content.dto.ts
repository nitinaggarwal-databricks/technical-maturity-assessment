import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateContentDto {
  @IsOptional()
  @IsString()
  copId?: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  assetType?: string;

  @IsOptional()
  @IsString()
  skillLevel?: string;

  @IsOptional()
  @IsString()
  personaTag?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  createdById?: string;
}


