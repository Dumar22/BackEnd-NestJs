import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { EntriesService } from './entries.service';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateDetailDto, CreateEntryDto, UpdateEntryDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from 'src/upload-xls/upload-xls.service';
import { Repository } from 'typeorm';
import { DetailsEntry, Entry } from './entities';

@Controller('entries')
export class EntriesController {
  constructor(
    private readonly entriesService: EntriesService, 
     ) {}

  @Post()
  @Auth()
  create(
  @Body() createEntryDto: CreateEntryDto,
  @Body('createDetailDto') createDetailDto: CreateDetailDto[],
  @GetUser() user: User,) {
    return this.entriesService.create(createEntryDto, createDetailDto, user);
  }  
  
@Post('upload-excel')
@Auth() 
@UseInterceptors(FileInterceptor('file'))
async createxls(
  @UploadedFile() file: Express.Multer.File, 
  @Body() createEntryDto: CreateEntryDto,  
  @GetUser() user: User,
) {  
    
  const fileBuffer = Buffer.from(file.buffer); // Obtener el buffer del archivo

  // Llamar al servicio para procesar el archivo y crear la entrada
  return this.entriesService.createEntryFromExcel(createEntryDto, user, fileBuffer);
}


  @Get()
  @Auth()
  findAll(
    @Query() paginationDto:PaginationDto,
    @GetUser() user: User,
  ) {
    return this.entriesService.findAll(paginationDto, user);
  }

  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string,
  @GetUser() user: User,) {
    return this.entriesService.findOne(term, user);
  }

  @Patch(':id')
  @Auth()
  update
  (@Param('id', ParseUUIDPipe) id: string,
  @Body() updateEntryDto: UpdateEntryDto,
  @Body('createDetailDto') createDetailDto: CreateDetailDto[],
  @GetUser() user: User,) {
    return this.entriesService.update(id, updateEntryDto, createDetailDto, user);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id',ParseUUIDPipe) id: string,
  @GetUser() user: User) {
    return this.entriesService.remove(id, user);
  }
}
