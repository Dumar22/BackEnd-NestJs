import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ToolAssignmentService } from './tool-assignment.service';
import { Auth, GetUser } from 'src/auth/decorators';
import { CreateToolAssignmentDto, UpdateToolAsignamentDto } from './dto';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';


@Controller('tool-asignament')
export class ToolAsignamentController {
  constructor(private readonly toolAssignmentService: ToolAssignmentService) {}

  @Post()
  @Auth()
  create(    
    @Body() createToolAssignmentDto: CreateToolAssignmentDto, 
    @GetUser() user: User
    ) {
    return this.toolAssignmentService.create(createToolAssignmentDto, user);
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
  @GetUser() user: User,) {
    return this.toolAssignmentService.update(id, updateToolAsignamentDto, user);
  }

  @Delete(':id')
  @Auth()
  deleteToolAssignment(@Param('id', ParseUUIDPipe) id: string,
  @GetUser() user: User) {
    return this.toolAssignmentService.remove(id, user);
  }
  
}
