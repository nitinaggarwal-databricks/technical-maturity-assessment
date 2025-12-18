import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CopPhase } from '@prisma/client';

export class CreateCopDto {
  @IsString()
  customerId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  mission?: string;

  @IsOptional()
  @IsString()
  vision?: string;

  @IsOptional()
  @IsString()
  charterUrl?: string;

  @IsOptional()
  @IsEnum(CopPhase)
  phase?: CopPhase;
}


