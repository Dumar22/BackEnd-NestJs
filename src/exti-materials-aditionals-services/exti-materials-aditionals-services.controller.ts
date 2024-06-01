import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExtiMaterialsAditionalsServicesService } from './exti-materials-aditionals-services.service';
import { CreateExtiMaterialsAditionalsServiceDto } from './dto/create-exti-materials-aditionals-service.dto';
import { UpdateExtiMaterialsAditionalsServiceDto } from './dto/update-exti-materials-aditionals-service.dto';

@Controller('exti-materials-aditionals-services')
export class ExtiMaterialsAditionalsServicesController {
  constructor(private readonly extiMaterialsAditionalsServicesService: ExtiMaterialsAditionalsServicesService) {}

  @Post()
  create(@Body() createExtiMaterialsAditionalsServiceDto: CreateExtiMaterialsAditionalsServiceDto) {
    return this.extiMaterialsAditionalsServicesService.create(createExtiMaterialsAditionalsServiceDto);
  }

  @Get()
  findAll() {
    return this.extiMaterialsAditionalsServicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.extiMaterialsAditionalsServicesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExtiMaterialsAditionalsServiceDto: UpdateExtiMaterialsAditionalsServiceDto) {
    return this.extiMaterialsAditionalsServicesService.update(+id, updateExtiMaterialsAditionalsServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.extiMaterialsAditionalsServicesService.remove(+id);
  }
}
