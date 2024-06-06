import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, Res, NotFoundException } from '@nestjs/common';
import { ExtiMaterialsAditionalsServicesService } from './exti-materials-aditionals-services.service';
import { CreateExtiMaterialsAditionalsServiceDto } from './dto/index';
import { UpdateExtiMaterialsAditionalsServiceDto} from './dto/index';
import { User } from 'src/auth/entities/user.entity';
import { Auth, GetUser } from 'src/auth/decorators';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateDetailExitMaterialsDto } from './dto/index';
import { UpdateDetailExitMaterialsDto } from './dto/index';
@Controller('exti-materials-aditionals-services')
export class ExtiMaterialsAditionalsServicesController {
  
  constructor(private readonly exitMaterialsService: ExtiMaterialsAditionalsServicesService) {}

  @Post()
  @Auth()
  create(@Body() createExitMaterialDto: CreateExtiMaterialsAditionalsServiceDto,
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


  @Get('pdf/:id')
   @Auth()
  async generateReport(
    @Param('id',ParseUUIDPipe) id: string,
    @GetUser() user: User,
    @Res() res ) : Promise<void> {
        
        try {
          const buffer = await this.exitMaterialsService.generarPDF(id,user);
    
          res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=example.pdf',
            'Content-Length': buffer.length.toString(),
          });
    
          res.end(buffer);
        } catch (error) {
           console.log(error);
          
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
    return this.exitMaterialsService.findOne(term, user);
  }

  @Patch(':id')
  @Auth()
  update(@Param('id') id: string, 
  @Body() updateExitMaterialDto: UpdateExtiMaterialsAditionalsServiceDto & { details: UpdateDetailExitMaterialsDto[], newDetails: CreateDetailExitMaterialsDto[] },
  @GetUser() user: User
  ) {
    const { details, newDetails, ...rest } = updateExitMaterialDto;
    
    return this.exitMaterialsService.update(id, updateExitMaterialDto,details, newDetails, user);
  }

  @Get('search/:term')
  @Auth()
  searchsearchExitMaterial(@Param('term') term: string,
  @GetUser() user:User
  ) {
    return this.exitMaterialsService.searchExitMaterial(term, user);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id', ParseUUIDPipe) id: string, 
  @GetUser() user: User) {
    return this.exitMaterialsService.remove(id, user);
  }
}
