import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @Auth()
  create(@Body() createVehicleDto: CreateVehicleDto,
  @GetUser() user: User,
  ) {
    return this.vehiclesService.create(createVehicleDto, user);
  }

  @Get()
  @Auth()
  findAll(
    @Query() paginationDto:PaginationDto,
    @GetUser() user:User
  ) {
    return this.vehiclesService.findAll(paginationDto, user);
  }

  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string,
  @GetUser() user:User
  ) {
    return this.vehiclesService.findOne(term, user);
  }

  @Patch(':id')
  @Auth()
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateVehicleDto: UpdateVehicleDto,
  @GetUser() user:User
  ) {
    return this.vehiclesService.update(id, updateVehicleDto, user);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id', ParseUUIDPipe) id: string,
  @GetUser() user:User) {
    return this.vehiclesService.remove(id, user);
  }
}
