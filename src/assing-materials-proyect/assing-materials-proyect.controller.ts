import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { AssingMaterialsProyectService } from './assing-materials-proyect.service';
import { CreateAssingMaterialsProyectDto } from './dto/create-assing-materials-proyect.dto';
import { UpdateAssingMaterialsProyectDto } from './dto/update-assing-materials-proyect.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { CreateAssingMaterialsDetailsProyectDto } from './dto/create-assing-materials-details-proyect.dto';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { UpdateAssingMaterialsDetailsProyectDto } from './dto/update-assing-materials-detais-proyect.dto';

@Controller('assing-materials-proyect')
export class AssingMaterialsProyectController {
  constructor(private readonly assingMaterialsProyectService: AssingMaterialsProyectService) {}

  @Post()
  @Auth()
  create(
    @Body() createAssingMaterialsProyectDto: CreateAssingMaterialsProyectDto,
    @Body('details') details: CreateAssingMaterialsDetailsProyectDto[],
    @GetUser() user: User) {
    return this.assingMaterialsProyectService.create(createAssingMaterialsProyectDto, details, user);
  }

  @Get()
  @Auth()
  findAll(
  @Query() paginationDto:PaginationDto,
  @GetUser() user: User
  ) {
    return this.assingMaterialsProyectService.findAll(paginationDto, user);
  }

  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string,
  @GetUser() user: User,) {
    return this.assingMaterialsProyectService.findOne(term, user);
  }

  @Auth()
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateAssingMaterialsProyectDto: UpdateAssingMaterialsProyectDto, details: UpdateAssingMaterialsDetailsProyectDto[], user: User){
    return this.assingMaterialsProyectService.update(id, updateAssingMaterialsProyectDto, details, user);
  }

  @Delete(':id')
  @Auth()
  deleteToolAssignment(@Param('id', ParseUUIDPipe) id: string,
  @GetUser() user: User) {
    return this.assingMaterialsProyectService.remove(id, user);
  }
}
