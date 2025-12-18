import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateUseCaseDto {
  @IsString()
  copId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  problem?: string;

  @IsOptional()
  @IsString()
  solution?: string;

  @IsOptional()
  @IsString()
  architectureUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productsUsed?: string[];

  @IsOptional()
  @IsString()
  outcomes?: string;

  @IsOptional()
  @IsString()
  createdById?: string;
}


