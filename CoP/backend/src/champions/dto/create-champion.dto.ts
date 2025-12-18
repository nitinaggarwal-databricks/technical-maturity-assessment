import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class CreateChampionDto {
  @IsString()
  copId: string;

  @IsString()
  userId: string;

  @IsISO8601()
  month: string; // any date within the month; we'll normalize to first of month

  @IsString()
  awardType: string;

  @IsOptional()
  @IsString()
  citation?: string;

  @IsOptional()
  @IsString()
  createdById?: string;
}


