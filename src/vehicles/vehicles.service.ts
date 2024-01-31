import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Vehicle } from './entities/vehicle.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class VehiclesService {

  private readonly logger = new Logger('MaterialsService')

  constructor(   
    @InjectRepository(Vehicle )
    private readonly vehiclesRepository: Repository<Vehicle>,

  ){}

  async create(createVehicleDto: CreateVehicleDto, user: User) {

    const existingVehicle = await this.vehiclesRepository.createQueryBuilder()
    .where('plate = :plate AND warehouseId = :warehouseId', { 
      plate: createVehicleDto.plate, 
      warehouseId: user.warehouses[0].id  
    })
    .getOne();
  
      if (existingVehicle) {
        throw new BadRequestException(`El vehículo con placa ${createVehicleDto.plate.toUpperCase()} ya existe en la bodega ${user.warehouses[0].name}.`);
      }

    try {   

       const vehicle = this.vehiclesRepository.create({
       ...createVehicleDto,
       user, 
       warehouse: user.warehouses[0]
        
      });

     await this.vehiclesRepository.save(vehicle);

      return {vehiculo: vehicle, message:'Vehículo creado'}
      
    } catch (error) {          
    console.log(error); 
      this.handleDBExeptions(error)
    }
   

  }

  async findAll(paginationDto: PaginationDto, user: User) {
    const { limit = 10, offset = 0 } = paginationDto;
  
    let vehiclesQuery = this.vehiclesRepository.createQueryBuilder('vehicle')
      .leftJoinAndSelect('vehicle.user', 'user')
      .leftJoinAndSelect('vehicle.warehouse', 'warehouse');
  
    if (!user.rol.includes('admin')) {
      // Si no es administrador, aplicar restricciones por bodega y usuario
      vehiclesQuery = vehiclesQuery
       
        .andWhere('warehouse.id IN (:...warehouseIds)', { warehouseIds: user.warehouses.filter(warehouse => warehouse.id) });
    }
    // Agrega la condición para excluir los vehículos eliminados
    vehiclesQuery = vehiclesQuery.andWhere('vehicle.deletedAt IS NULL');
  
    const vehicles = await vehiclesQuery
      .skip(offset)
      .take(limit)
      .getMany();
  
    return vehicles;
  }

 async findOne(term: string, user: User) {
   
   let vehicle: Vehicle;
     if (isUUID(term)) {
      vehicle = await this.vehiclesRepository.findOneBy({id: term});
     }else{      
      const queryBuilder = this.vehiclesRepository.createQueryBuilder();
      vehicle = await queryBuilder
       .where('UPPER(plate) =:plate or UPPER(make) =:make',{
        plate: term.toUpperCase(),
        make: term.toUpperCase(),
       }).getOne();
    }    
    if (!vehicle)
      throw new NotFoundException(`El vehículo no fue encontrado.`);

      return vehicle;
  }  
  
 async update(id: string, updateVehicleDto: UpdateVehicleDto, user: User) {
 
  const vehicleId = await this.vehiclesRepository.findOneBy({id: id});

  if (!vehicleId)
    throw new NotFoundException(`El vehículo no fue encontrado.`);
 
    const vehicle = await this.vehiclesRepository.preload({
      id: id,
      ...updateVehicleDto
    });
      
    const existingVehicle = await this.vehiclesRepository.createQueryBuilder('vehicle')
    .where('LOWER(vehicle.plate) = LOWER(:plate) AND vehicle.warehouseId = :warehouseId AND vehicle.id != :vehicleId', {
      plate: updateVehicleDto.plate,
      warehouseId: user.warehouses[0].id,
      vehicleId: id,
    })
    .getOne();

  if (existingVehicle) {
    throw new BadRequestException(`El vehículo con placa ${updateVehicleDto.plate.toUpperCase()} ya existe en la bodega ${user.warehouses[0].name}.`);
  }   
        try {
          await this.vehiclesRepository.save(vehicle);
          return vehicle;
   
        } catch (error) {
          this.handleDBExeptions(error)
        }
  }

  async remove(id: string, user: User) {

    const vehicle = await this.vehiclesRepository.findOneBy({id: id});

  if (vehicle) {
    vehicle.deletedBy = user.id;
    vehicle.deletedAt = new Date();

    await this.vehiclesRepository.save(vehicle);
    // const material = await this.findOne( id );
    //await this.materialsRepository.delete({ id });
    return {message:'Vehículo eliminado.'}
  }else{
    throw new NotFoundException(`El vehículo no fue encontrado.`);
  }
}


  private handleDBExeptions(error: any){    

    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException('La placa ya existe.');
    }

       this.logger.error(error);
            
      throw new InternalServerErrorException('Unexpected error, check server logs');
  }
  


}
