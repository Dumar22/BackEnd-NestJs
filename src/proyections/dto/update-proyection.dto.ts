import { PartialType } from '@nestjs/mapped-types';
import { CreateProyectionDto } from './create-proyection.dto';

export class UpdateProyectionDto extends PartialType(CreateProyectionDto) {}
