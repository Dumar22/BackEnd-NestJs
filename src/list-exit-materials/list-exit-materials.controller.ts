import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ListExitMaterialsService } from './list-exit-materials.service';
import { CreateDetailsMaterialsDto, CreateListExitMaterialDto } from './dto/create-list-exit-material.dto';
import { UpdateDetailsMaterialsDto, UpdateListExitMaterialDto } from './dto/update-list-exit-material.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('list-exit-materials')
export class ListExitMaterialsController {
  constructor(private readonly listExitMaterialsService: ListExitMaterialsService) {}

  @Post()
  @Auth()
  create(
  @Body() createListExitMaterialDto: CreateListExitMaterialDto,
  @Body('details') details: CreateDetailsMaterialsDto[],
  @GetUser() user: User,
  ) {
    return this.listExitMaterialsService.create(createListExitMaterialDto,details, user);
  }

  @Get()
  @Auth()
  findAll(
    @Query() paginationDto:PaginationDto,
    @GetUser() user:User
    ) {
    return this.listExitMaterialsService.findAll(paginationDto, user);
  }

  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string,
  @GetUser() user: User,) {
    return this.listExitMaterialsService.findOne(term, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateListExitMaterialDto: UpdateListExitMaterialDto,
    @Body('details') details: UpdateDetailsMaterialsDto[],
    @GetUser() user: User,) {
    return this.listExitMaterialsService.update(id, updateListExitMaterialDto, details, user);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id', ParseUUIDPipe) id: string,
  @GetUser() user:User
  ) {
    return this.listExitMaterialsService.remove(id, user);
  }
}
