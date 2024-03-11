import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UploadedFile, UseInterceptors, BadRequestException, Res, NotFoundException } from '@nestjs/common';
import { EntriesService } from './entries.service';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateDetailDto, CreateEntryDto, UpdateEntryDto, UpdateDetailDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';


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


@Get('pdf/:id')
   @Auth()
  async generateReport(
    @Param('id',ParseUUIDPipe) id: string,
    @GetUser() user: User,
    @Res() res ) : Promise<void> {
        
        try {
          const buffer = await this.entriesService.generarPDF(id,user);
    
          res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=example.pdf',
            'Content-Length': buffer.length.toString(),
          });
    
          res.end(buffer);
        } catch (error) {
          if (error instanceof NotFoundException) {
            res.status(404).json({ message: error.message });
          } else {
            res.status(500).json({ message: 'Error interno del servidor' });
          }
        }
      }


  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string,
  @GetUser() user: User,) {
    return this.entriesService.findOne(term, user);
  }

  @Get('search/:term')
  @Auth()
  searchEntry(@Param('term') term: string,
  @GetUser() user:User
  ) {
    return this.entriesService.searchEntry(term, user);
  }


  @Patch(':id')
  @Auth()
  update(@Param('id', ParseUUIDPipe) id: string,
  @Body() updateEntryDto: UpdateEntryDto,
  @Body() updateDetailDto: UpdateDetailDto[],
  @GetUser() user: User,) {
    return this.entriesService.update(id, updateEntryDto, updateDetailDto, user);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id',ParseUUIDPipe) id: string,
  @GetUser() user: User) {
    return this.entriesService.remove(id, user);
  }
}
