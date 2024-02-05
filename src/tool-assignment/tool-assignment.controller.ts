import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, Res, NotFoundException } from '@nestjs/common';
import { ToolAssignmentService } from './tool-assignment.service';
import { Auth, GetUser } from 'src/auth/decorators';
import { CreateToolAssignmentDto, UpdateToolAsignamentDto } from './dto';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateToolAssignmentDetailsDto } from './dto/create-tool-assignment.dto';
import { UpdateToolAssignmentDetailsDto } from './dto/update-tool-assignment.dto';


@Controller('tool-asignament')
export class ToolAsignamentController {
  constructor(private readonly toolAssignmentService: ToolAssignmentService) {}

  @Post()
  @Auth()
  create(    
    @Body() createToolAssignmentDto: CreateToolAssignmentDto, 
    @Body('details') details: CreateToolAssignmentDetailsDto[],
    @GetUser() user: User
    ) {
    return this.toolAssignmentService.create(createToolAssignmentDto, details, user);
  }


  @Get()
  @Auth()
  findAll(
  @Query() paginationDto:PaginationDto,
  @GetUser() user: User,
  ) {
    return this.toolAssignmentService.findAll(paginationDto, user);
  }

  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string,
  @GetUser() user: User,) {
    return this.toolAssignmentService.findOne(term, user);
  }

  @Get('search/:term')
  @Auth()
  searchToolAssignment(@Param('term') term: string,
  @GetUser() user:User
  ) {
    return this.toolAssignmentService.searchToolAssignment(term, user);
  }
    
  @Patch(':id')
  @Auth()
  update
  (@Param('id', ParseUUIDPipe) id: string,
  @Body() updateToolAsignamentDto: UpdateToolAsignamentDto,
  @Body('details') details: UpdateToolAssignmentDetailsDto[],
  @GetUser() user: User,) {
    return this.toolAssignmentService.update(id, updateToolAsignamentDto, details, user);
  }

  @Delete(':id')
  @Auth()
  deleteToolAssignment(@Param('id', ParseUUIDPipe) id: string,
  @GetUser() user: User) {
    return this.toolAssignmentService.remove(id, user);
  }


  @Get('pdf/:id')
   @Auth()
  async generateReport(
    @Param('id',ParseUUIDPipe) id: string,
    @GetUser() user: User,
    @Res() res ) : Promise<void> {
        
        try {
          const buffer = await this.toolAssignmentService.generarPDF(id,user);
    
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
  
}
