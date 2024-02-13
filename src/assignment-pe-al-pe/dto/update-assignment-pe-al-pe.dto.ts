import { PartialType } from '@nestjs/mapped-types';
import { AssignmentPealPeDetailsDto, CreateAssignmentPeAlPeDto } from './create-assignment-pe-al-pe.dto';

export class UpdateAssignmentPeAlPeDto extends PartialType(CreateAssignmentPeAlPeDto) {}


export class UpdateAssignmentPealPeDetailsDto extends PartialType(AssignmentPealPeDetailsDto){}