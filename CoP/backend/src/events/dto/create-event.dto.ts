import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class CreateEventDto {
  @IsString()
  copId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  eventType?: string;

  @IsISO8601()
  startsAt: string;

  @IsOptional()
  @IsISO8601()
  endsAt?: string;

  @IsOptional()
  @IsString()
  location?: string;
}


