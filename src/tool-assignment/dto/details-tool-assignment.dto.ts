import { Type } from 'class-transformer';
import { IsUUID, IsBoolean, IsDate, IsNumber, IsString, IsPositive, IsOptional } from 'class-validator';
export class CreateToolAssignmentDetailDto {

  @IsString() 
  @IsUUID()
  toolId: string;

  @IsNumber()
  @IsPositive()
  assignedQuantity: number;

  @IsString()
  @IsOptional()
  observation?: string;

  @IsString()
  @IsOptional()
  event: string;
 
  @IsDate()
  @Type(() => Date)
  assignedAt: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  returnedA?: Date;

  @IsBoolean()
  returnTools?: boolean;
}