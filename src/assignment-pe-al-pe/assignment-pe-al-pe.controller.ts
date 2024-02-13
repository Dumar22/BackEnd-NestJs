import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, ParseUUIDPipe, Query, Res } from '@nestjs/common';
import { AssignmentPeAlPeService } from './assignment-pe-al-pe.service';
import { AssignmentPealPeDetailsDto, CreateAssignmentPeAlPeDto } from './dto/create-assignment-pe-al-pe.dto';
import { UpdateAssignmentPeAlPeDto, UpdateAssignmentPealPeDetailsDto } from './dto/update-assignment-pe-al-pe.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('assignment-pe-al-pe')
export class AssignmentPeAlPeController {
  constructor(private readonly assignmentPeAlPe: AssignmentPeAlPeService) {}

  @Post()
  @Auth()
  create(
    @Body() createAssignmentPeAlPeDto: CreateAssignmentPeAlPeDto,
    @Body('details') details: AssignmentPealPeDetailsDto[],
    @GetUser() user: User
    ) {      
    return this.assignmentPeAlPe.create(createAssignmentPeAlPeDto, details, user);
  }

  @Get()
  @Auth()
  findAll(
  @Query() paginationDto:PaginationDto,
  @GetUser() user: User,
  ) {
    return this.assignmentPeAlPe.findAll(paginationDto, user);
  }

  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string,
  @GetUser() user: User,) {
    return this.assignmentPeAlPe.findOne(term,user);
  }


  @Get('pdf/:id')
   @Auth()
  async generateReport(
    @Param('id',ParseUUIDPipe) id: string,
    @GetUser() user: User,
    @Res() res ) : Promise<void> {
        
        try {
          const buffer = await this.assignmentPeAlPe.generarPDF(id,user);
    
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

  // @Patch(':id')
  // @Auth()
  // update(
  //   @Param('id', ParseUUIDPipe) id: string, 
  //   @Body()  updateAssignmentPeAlPeDto:  UpdateAssignmentPeAlPeDto,
  // details: UpdateAssignmentPealPeDetailsDto[], user: User ) {
  //   return this.assignmentPeAlPe.update(id,  updateAssignmentPeAlPeDto, details, user);
  // }

  @Delete(':id')
  @Auth()
  deleteToolAssignment(@Param('id', ParseUUIDPipe) id: string,
  @GetUser() user: User) {
    return this.assignmentPeAlPe.remove(id, user);
  }
}

