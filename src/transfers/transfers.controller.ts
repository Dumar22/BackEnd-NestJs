import { Controller, Get, Post, Body, Param, Delete, Query, ParseUUIDPipe, Res, BadRequestException, NotFoundException, Patch } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { Auth, GetUser } from 'src/auth/decorators';
import { CreateDetailTransferDto, UpdateDetailTransferDto, UpdateTransferDto, } from './dto';
import { User } from 'src/auth/entities/user.entity';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';



@Controller('transfers')
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Post()
  @Auth()
  create(
  @Body() createTransferDto: CreateTransferDto,
  @Body('createDetailTransferDto') createDetailTransferDto: CreateDetailTransferDto[],
  @GetUser() user: User
  ) {
    return this.transfersService.create(createTransferDto,createDetailTransferDto, user);
  }

  @Get()
  @Auth()
  findAll(
    @Query() paginationDto:PaginationDto,
    @GetUser() user: User
  ) {
    return this.transfersService.findAll(paginationDto,user);
  }

  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string,
  @GetUser() user: User) {
    return this.transfersService.findOne(term, user);
  }

  @Get('pdf/:id')
   @Auth()
  async generateReport(
    @Param('id',ParseUUIDPipe) id: string,
    @GetUser() user: User,
    @Res() res ) : Promise<void> {
        
        try {
          const buffer = await this.transfersService.generarPDF(id,user);
    
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
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateTransferDto: UpdateTransferDto,
  @Body('updateDetailTransferDto') updateDetailTransferDto: UpdateDetailTransferDto[],
  @GetUser() user: User) {
    return this.transfersService.update(id, updateTransferDto, updateDetailTransferDto, user);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id', ParseUUIDPipe) id: string,
  @GetUser() user: User
  ) {
    return this.transfersService.remove(id, user);
  }
}
