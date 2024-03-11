import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ProyectionsService } from './proyections.service';
import { CreateDetailsProyectionDto, CreateProyectionDto } from './dto/create-proyection.dto';
import { UpdateDetailsProyectionDto, UpdateProyectionDto } from './dto/update-proyection.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('proyections')
export class ProyectionsController {
  constructor(private readonly proyectionsService: ProyectionsService) {}

  @Post()
  @Auth()
  create(@Body() createProyectionDto: CreateProyectionDto,
  @Body('createDetailsProyectionDto') createDetailsProyectionDto: CreateDetailsProyectionDto[],
  @GetUser() user: User,
  ) {
    return this.proyectionsService.create(createProyectionDto, createDetailsProyectionDto, user );
  }

  @Get()
  @Auth()
  findAll(
    @Query() paginationDto:PaginationDto,
    @GetUser() user: User,
  ) {
    return this.proyectionsService.findAll(paginationDto, user);
  }

  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string,
  @GetUser() user: User,
  ) {
    return this.proyectionsService.findOne(term, user);
  }

  @Patch(':id')
  @Auth()
  update(@Param('id', ParseUUIDPipe) id: string, 
  @Body() updateProyectionDto: UpdateProyectionDto,
  @Body() updateDetailsProyectionDto: UpdateDetailsProyectionDto[],
  @GetUser() user: User
  ) {
    return this.proyectionsService.update( id, updateProyectionDto, updateDetailsProyectionDto, user);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id',ParseUUIDPipe) id: string,
  @GetUser() user: User) {
    return this.proyectionsService.remove(id, user);
  }
}
