import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ProyectsService } from './proyects.service';
import { CreateProyectDto } from './dto/create-proyect.dto';
import { UpdateProyectDto } from './dto/update-proyect.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('proyects')
export class ProyectsController {
  constructor(private readonly proyectsService: ProyectsService) {}

  @Post()
  @Auth()
  create(@Body() createProyectDto: CreateProyectDto,
  @GetUser() user: User) {
    return this.proyectsService.create(createProyectDto, user);
  }

  @Get()
  @Auth()
  findAll(
    @Query() paginationDto:PaginationDto,
    @GetUser() user:User
  ) {
    return this.proyectsService.findAll(paginationDto, user);
  }

  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string,
  @GetUser() user:User) {
    return this.proyectsService.findOne(term, user);
  }

  @Get('search/:term')
  @Auth()
  searchProyect(@Param('term') term: string,
  @GetUser() user:User
  ) {
    return this.proyectsService.searchProyect(term, user);
  }

  @Patch(':id')
  @Auth()
  update(@Param('id',ParseUUIDPipe) id: string,
   @Body() updateProyectDto: UpdateProyectDto,
   @GetUser() user:User ) {
    return this.proyectsService.update(id, updateProyectDto, user);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id', ParseUUIDPipe) id: string,
  @GetUser() user:User) {
    return this.proyectsService.remove(id, user);
  }
}
