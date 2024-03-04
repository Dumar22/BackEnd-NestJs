import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProyectionsService } from './proyections.service';
import { CreateProyectionDto } from './dto/create-proyection.dto';
import { UpdateProyectionDto } from './dto/update-proyection.dto';

@Controller('proyections')
export class ProyectionsController {
  constructor(private readonly proyectionsService: ProyectionsService) {}

  @Post()
  create(@Body() createProyectionDto: CreateProyectionDto) {
    return this.proyectionsService.create(createProyectionDto);
  }

  @Get()
  findAll() {
    return this.proyectionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proyectionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProyectionDto: UpdateProyectionDto) {
    return this.proyectionsService.update(+id, updateProyectionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.proyectionsService.remove(+id);
  }
}
