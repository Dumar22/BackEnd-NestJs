import { PartialType } from '@nestjs/mapped-types';
import { CreateAssingMaterialsProyectDto } from './create-assing-materials-proyect.dto';

export class UpdateAssingMaterialsProyectDto extends PartialType(CreateAssingMaterialsProyectDto) {}
