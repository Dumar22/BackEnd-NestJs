import { PartialType } from '@nestjs/mapped-types';
import { CreateAssingMaterialsDetailsProyectDto } from './create-assing-materials-details-proyect.dto';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, IsNumber, IsPositive, IsDate, IsBoolean } from 'class-validator';

export class UpdateAssingMaterialsDetailsProyectDto extends PartialType(CreateAssingMaterialsDetailsProyectDto) {

    @IsOptional()
    @IsString() 
    @IsUUID()
    materialId?: string;
  
    @IsNumber()
    @IsPositive()
    assignedQuantity: number;
      
    @IsString()
    @IsOptional()
    observation?: string;
       
    @IsDate()
    @Type(() => Date)
    assignedAt: Date;
  
    @IsDate()
    @IsOptional()
    @Type(() => Date)
    returnedA?: Date;
  
    @IsBoolean()
    returnMaterials?: boolean;
}
