import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService,
    
    ) {}

  @Post()
  @Auth()
  create(
    @Body() createMaterialDto: CreateMaterialDto,
    @GetUser() user: User,
    ) {
    return this.materialsService.create(createMaterialDto, user);
  }

  @Post('upload-excel')
  @Auth()
  @UseInterceptors(FileInterceptor('file'))
  async createxls(@UploadedFile() file: Express.Multer.File, createMaterialDto: CreateMaterialDto, 
  @GetUser() user: User) {
    return this.materialsService.createxls( file.buffer,  createMaterialDto, user,);
  }

 

  @Get()
  @Auth()
  findAll(
    @Query() paginationDto:PaginationDto,
    @GetUser() user:User
    ) {
    //console.log(paginationDto);    
    return this.materialsService.findAll( paginationDto, user);
  }

  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string,
  @GetUser() user:User
  ) {
    return this.materialsService.findOne(term, user);
  }

  @Patch(':id')
  @Auth()
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateMaterialDto: UpdateMaterialDto,
  @GetUser() user:User
  ) {
    return this.materialsService.update(id, updateMaterialDto, user);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id', ParseUUIDPipe) id: string,
  @GetUser() user:User
  ) {
    return this.materialsService.remove(id, user);
  }
}
