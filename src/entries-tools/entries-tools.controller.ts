import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseUUIDPipe, Res, NotFoundException, Query } from '@nestjs/common';
import { EntriesToolsService } from './entries-tools.service';
import { CreateEntriesToolDto } from './dto/create-entries-tool.dto';
import { CreateDetailDto } from './dto/create-details-entries.dto';
import { UpdateEntriesToolDto } from './dto/update-entries-tool.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { UpdateDetailToolDto } from './dto/update-details-entries.dto';

@Controller('entries-tools')
export class EntriesToolsController {
  constructor(private readonly entriesToolsService: EntriesToolsService) {}

  @Post()
  @Auth()
  create(
  @Body() createEntryDto: CreateEntriesToolDto,
  @Body('createDetailDto') createDetailDto: CreateDetailDto[],
  @GetUser() user: User,) {
    return this.entriesToolsService.create(createEntryDto, createDetailDto, user);
  }  
  
@Post('upload-excel')
@Auth() 
@UseInterceptors(FileInterceptor('file'))
async createxls(
  @UploadedFile() file: Express.Multer.File, 
  @Body() createEntryDto: CreateEntriesToolDto,  
  @GetUser() user: User,
) {  
    
  const fileBuffer = Buffer.from(file.buffer); // Obtener el buffer del archivo

  // Llamar al servicio para procesar el archivo y crear la entrada
  return this.entriesToolsService.createEntryFromExcel(createEntryDto, user, fileBuffer);
}


@Get('pdf/:id')
   @Auth()
  async generateReport(
    @Param('id',ParseUUIDPipe) id: string,
    @GetUser() user: User,
    @Res() res ) : Promise<void> {
        
        try {
          const buffer = await this.entriesToolsService.generarPDF(id,user);
    
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


  @Get()
  @Auth()
  findAll(
    @Query() paginationDto:PaginationDto,
    @GetUser() user: User,
  ) {
    return this.entriesToolsService.findAll(paginationDto, user);
  }

  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string,
  @GetUser() user: User,) {
    return this.entriesToolsService.findOne(term, user);
  }

  @Get('search/:term')
  @Auth()
  searchEntry(@Param('term') term: string,
  @GetUser() user:User
  ) {
    return this.entriesToolsService.searchEntry(term, user);
  }


  @Patch(':id')
  @Auth()
  update
  (@Param('id', ParseUUIDPipe) id: string,
  @Body() updateEntryDto: UpdateEntriesToolDto,
  @Body() updateDetailDto: UpdateDetailToolDto[],
  @GetUser() user: User,) {
    return this.entriesToolsService.update(id, updateEntryDto, updateDetailDto, user);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id',ParseUUIDPipe) id: string,
  @GetUser() user: User) {
    return this.entriesToolsService.remove(id, user);
  }
}
