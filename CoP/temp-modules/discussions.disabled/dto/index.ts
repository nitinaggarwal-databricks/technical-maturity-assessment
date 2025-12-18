import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateThreadDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  body?: string;
}

export class CreateReplyDto {
  @IsString()
  @IsNotEmpty()
  body: string;
}

