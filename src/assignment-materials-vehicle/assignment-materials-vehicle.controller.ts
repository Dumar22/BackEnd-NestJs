import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, NotFoundException, Res } from '@nestjs/common';
import { AssignmentMaterialsVehicleService } from './assignment-materials-vehicle.service';

import { UpdateAssignmentMaterialsVehicleDto } from './dto/update-assignment-materials-vehicle.dto';
import { CreateAssignmentDetailsMaterialsVehicleDto, CreateAssignmentMaterialsVehicleDto, UpdateAssignmentDetailsMaterialsVehicleDto } from './dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('assignment-materials-vehicle')
export class AssignmentMaterialsVehicleController {
  constructor(private readonly assignmentMaterialsVehicleService: AssignmentMaterialsVehicleService) {}

  @Post()
  @Auth()
  create(
    @Body() createAssignmentMaterialsVehicleDto: CreateAssignmentMaterialsVehicleDto,
    @Body('details') details: CreateAssignmentDetailsMaterialsVehicleDto[],
    @GetUser() user: User
    ) {      
    return this.assignmentMaterialsVehicleService.create(createAssignmentMaterialsVehicleDto, details, user);
  }

  @Get()
  @Auth()
  findAll(
  @Query() paginationDto:PaginationDto,
  @GetUser() user: User,
  ) {
    return this.assignmentMaterialsVehicleService.findAll(paginationDto, user);
  }

  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string,
  @GetUser() user: User,) {
    return this.assignmentMaterialsVehicleService.findOne(term,user);
  }


  @Get('pdf/:id')
   @Auth()
  async generateReport(
    @Param('id',ParseUUIDPipe) id: string,
    @GetUser() user: User,
    @Res() res ) : Promise<void> {
        
        try {
          const buffer = await this.assignmentMaterialsVehicleService.generarPDF(id,user);
    
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

  @Patch(':id')
  @Auth()
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateAssignmentMaterialsVehicleDto: UpdateAssignmentMaterialsVehicleDto,
  details: UpdateAssignmentDetailsMaterialsVehicleDto[], user: User ) {
    return this.assignmentMaterialsVehicleService.update(id, updateAssignmentMaterialsVehicleDto, details, user);
  }

  @Delete(':id')
  @Auth()
  deleteToolAssignment(@Param('id', ParseUUIDPipe) id: string,
  @GetUser() user: User) {
    return this.assignmentMaterialsVehicleService.remove(id, user);
  }
}
