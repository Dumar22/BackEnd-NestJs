import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ExitMaterialsService } from './exit-materials.service';
import { CreateExitMaterialDto } from './dto/create-exit-material.dto';
import { UpdateExitMaterialDto } from './dto/update-exit-material.dto';
import { User } from 'src/auth/entities/user.entity';
import { Auth, GetUser } from 'src/auth/decorators';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateDetailExitMaterialsDto } from './dto/create-details-exit-materials.dto';

@Controller('exit-materials')
export class ExitMaterialsController {
  constructor(private readonly exitMaterialsService: ExitMaterialsService) {}

  @Post()
  @Auth()
  create(@Body() createExitMaterialDto: CreateExitMaterialDto,
  @Body('details') details: CreateDetailExitMaterialsDto[],
    @GetUser() user: User) {
    return this.exitMaterialsService.create(createExitMaterialDto,details, user);
  }

  @Get()
  @Auth()
  findAll(
  @Query() paginationDto:PaginationDto,
  @GetUser() user: User,
  ) {
    return this.exitMaterialsService.findAll(paginationDto, user);
  }

  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string,
  @GetUser() user: User,) {
    return this.exitMaterialsService.findOne(term, user);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateExitMaterialDto: UpdateExitMaterialDto) {
  //   return this.exitMaterialsService.update(+id, updateExitMaterialDto);
  // }

  @Delete(':id')
  @Auth()
  remove(@Param('id', ParseUUIDPipe) id: string, 
  @GetUser() user: User) {
    return this.exitMaterialsService.remove(id, user);
  }
}
