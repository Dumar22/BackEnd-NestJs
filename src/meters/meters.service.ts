import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateMeterDto } from './dto/create-meter.dto';
import { UpdateMeterDto } from './dto/update-meter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meter } from './entities/meter.entity';
import { isUUID } from 'class-validator';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class MetersService {

  private readonly logger = new Logger('MetersService')

  constructor(   
    @InjectRepository( Meter)
    private readonly metersRepository: Repository<Meter>,

  ){}

  async create(createMeterDto: CreateMeterDto, user: User) {


    const existingMeter = await this.metersRepository.createQueryBuilder()
    .where('meter.serial = :serial AND warehouseId = :warehouseId', { 
      serial: createMeterDto.serial, 
      //code: createMeterDto.brand,
      warehouseId: user.warehouses[0].id  
    })
    .getOne();
  
      if (existingMeter) {
        throw new BadRequestException(`El medidor con serie ${createMeterDto.serial} ya existe en la bodega ${user.warehouses[0].name}.`);
      }

      if (createMeterDto.quantity > 1 ) 
        createMeterDto.quantity = 1
      

    try {   

       const meter = this.metersRepository.create({
       ...createMeterDto,
       user, 
       warehouse: user.warehouses[0]
        
      });

     await this.metersRepository.save(meter);

      return {medidor: meter, message:'Medidor creado'}
      
    } catch (error) {          
      //console.log(error); 
      this.handleDBExeptions(error)
    }
   

  }

  async findAll(paginationDto: PaginationDto, user: User) {
    const { limit = 10, offset = 0 } = paginationDto;
  
    let metersQuery = this.metersRepository.createQueryBuilder('meter')
      .leftJoinAndSelect('meter.user', 'user')
      .leftJoinAndSelect('meter.warehouse', 'warehouse');
  
    if (!user.rol.includes('admin')) {
      // Si no es administrador, aplicar restricciones por bodega
      metersQuery = metersQuery
        .where('user.id = :userId', { userId: user.id })
        .andWhere('warehouse.id IN (:...warehouseIds)', { warehouseIds: user.warehouses.map(warehouse => warehouse.id) });
    }
    // Agrega la condición para excluir las erramientas eliminados
      metersQuery = metersQuery.andWhere('meter.deletedAt IS NULL');
  
    const meters = await metersQuery
      .skip(offset)
      .take(limit)
      .getMany();
  
    return meters
  }

 async findOne(term: string, user: User) {
   
   let meter: Meter;
     if (isUUID(term)) {
      meter = await this.metersRepository.findOneBy({id: term});
     }else{      
      const queryBuilder = this.metersRepository.createQueryBuilder();
      meter = await queryBuilder
       .where('UPPER(name) =:name or code =:code',{
        name: term.toUpperCase(),
        code: term.toLowerCase(),
       }).getOne();
    }    
    if (!meter)
      throw new NotFoundException(`Medidor no fue encontrado.`);

      return meter;
  }  
  
 async update(id: string, updateMeterDto: UpdateMeterDto, user: User) {
 
  const meterId = await this.metersRepository.findOneBy({id: id});

  if (!meterId)
    throw new NotFoundException(`Medidor no fue encontrado.`);
 
    const meter = await this.metersRepository.preload({
      id: id,
      ...updateMeterDto
    });
      
    const existingMeter = await this.metersRepository.createQueryBuilder('meter')
    .where('LOWER(meter.serial) = LOWER(:serial) AND meter.warehouseId = :warehouseId AND meter.id != :meterId', {
      serial: updateMeterDto.serial,
      warehouseId: user.warehouses[0].id,
      meterId: id,
    })
    .getOne();

  if (existingMeter) {
    throw new BadRequestException(`El medidor con serial ${updateMeterDto.serial} ya existe en la bodega ${user.warehouses[0].name}.`);
  }   
        try {
          await this.metersRepository.save(meter);
          return meter;
   
        } catch (error) {
          this.handleDBExeptions(error)
        }
  }

  async remove(id: string, user: User) {

    const meter = await this.metersRepository.findOneBy({id: id});

  if (meter) {
    meter.deletedBy = user.id;
    meter.deletedAt = new Date();

    await this.metersRepository.save(meter);
    // const material = await this.findOne( id );
    //await this.materialsRepository.delete({ id });
    return {message:'Medidor eliminado.'}
  }else{
    throw new NotFoundException(`El medidor no fue encontrado.`);
  }
}


  private handleDBExeptions(error: any){    

    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException('El medidor con serial ya existe.');
    }

       this.logger.error(error);
            
      throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
