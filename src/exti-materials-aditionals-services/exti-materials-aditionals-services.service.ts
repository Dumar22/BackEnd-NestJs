import { Injectable } from '@nestjs/common';
import { CreateExtiMaterialsAditionalsServiceDto } from './dto/create-exti-materials-aditionals-service.dto';
import { UpdateExtiMaterialsAditionalsServiceDto } from './dto/update-exti-materials-aditionals-service.dto';

@Injectable()
export class ExtiMaterialsAditionalsServicesService {
  create(createExtiMaterialsAditionalsServiceDto: CreateExtiMaterialsAditionalsServiceDto) {
    return 'This action adds a new extiMaterialsAditionalsService';
  }

  findAll() {
    return `This action returns all extiMaterialsAditionalsServices`;
  }

  findOne(id: number) {
    return `This action returns a #${id} extiMaterialsAditionalsService`;
  }

  update(id: number, updateExtiMaterialsAditionalsServiceDto: UpdateExtiMaterialsAditionalsServiceDto) {
    return `This action updates a #${id} extiMaterialsAditionalsService`;
  }

  remove(id: number) {
    return `This action removes a #${id} extiMaterialsAditionalsService`;
  }
}
