import { PartialType } from '@nestjs/mapped-types';
import { CreateDetailsMaterialsDto, CreateListExitMaterialDto } from './create-list-exit-material.dto';

export class UpdateListExitMaterialDto extends PartialType(CreateListExitMaterialDto) {

  
}

export class UpdateDetailsMaterialsDto extends PartialType(CreateDetailsMaterialsDto) {


}
