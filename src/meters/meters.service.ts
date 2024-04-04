import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateMeterDto } from './dto/create-meter.dto';
import { UpdateMeterDto } from './dto/update-meter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Meter } from './entities/meter.entity';
import { isUUID } from 'class-validator';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FileUploadService } from 'src/upload-xls/upload-xls.service';

@Injectable()
export class MetersService {

  private readonly logger = new Logger('MetersService')

  constructor(   
    @InjectRepository( Meter)
    private readonly metersRepository: Repository<Meter>,
    private readonly fileUploadService: FileUploadService
  ){}

  async create(createMeterDto: CreateMeterDto, user: User) {


    const existingMeter = await this.metersRepository.createQueryBuilder('meter')
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

  async createxls(fileBuffer: Buffer, createMaterialDto: CreateMeterDto, user: User) {
    try {
      // Lógica para procesar el archivo Excel y obtener la lista de materiales
      const meters = await this.fileUploadService.processExcel(fileBuffer, this.metersRepository, (entry: CreateMeterDto) => {
        return this.meterDataFormat(entry, user);
      });   
        
      // Lista de materiales que no fueron cargados
      const failedMeters: { meter: CreateMeterDto; reason: string }[] = [];
  
      for (const meter of meters) {
        const existingmeter = await this.metersRepository.createQueryBuilder('meter')
        .where('meter.serial = :serial AND warehouseId = :warehouseId', {
          serial: meter.serial,  
          warehouseId: user.warehouses[0].id  
        })
    .getOne();
          
    if (existingmeter) {
      failedMeters.push({ 
        meter,
        reason: `El medidor con serie ${meter.serial} ya existe en la bodega ${user.warehouses[0].name}.` 
      });    
    } else {    
      // Guardar el material solo si no existe
      await this.metersRepository.save(meter);     
    }
      }
  
      return { meters, failedMeters, message: 'Medidores creados' };
    } catch (error) {
      // console.log(error);
      this.handleDBExeptions(error);
    }
  }
  
  private meterDataFormat(entry: CreateMeterDto, user: User): Meter {
    return this.metersRepository.create({
      ...entry,
      user,
      warehouse: user.warehouses[0],
    });
  }


  async findAll(paginationDto: PaginationDto, user: User) {
    // const { limit = 10, offset = 0 } = paginationDto;
  
    let metersQuery = this.metersRepository.createQueryBuilder('meter')
      .leftJoinAndSelect('meter.user', 'user')
      .leftJoinAndSelect('meter.warehouse', 'warehouse');
  
    if (!user.rol.includes('admin')) {
      // Si no es administrador, aplicar restricciones por bodega
      metersQuery = metersQuery
        // .andWhere('user.id = :userId', { userId: user.id })
        .andWhere('warehouse.id IN (:...warehouseIds)', { warehouseIds: user.warehouses.map(warehouse => warehouse.id) });
    }
    // Agrega la condición para excluir las erramientas eliminados
      metersQuery = metersQuery.andWhere('meter.deletedAt IS NULL');
  
    const meters = await metersQuery
      // .skip(offset)
      // .take(limit)
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

  /* async searchMeter(term: string, user: User) {
    let data = await this.metersRepository.find({
      where: [
        { name: Like(`%${term}%`) },
        { code: Like(`%${term}%`) },
        { serial: Like(`%${term}%`) },
        { brand: Like(`%${term}%`) },
      ],
    });
    return data;
  } */

  async searchMeter(term: string, user: User) {
    let meterQuery = this.metersRepository.createQueryBuilder('meter')
      .leftJoinAndSelect('meter.user', 'user')
      .leftJoinAndSelect('meter.warehouse', 'warehouse')
      .where(
        '(meter.serial LIKE :term OR meter.code LIKE :term OR meter.name LIKE :term )',
        { term: `%${term}%` },
      );  
    if (!user.rol.includes('admin')) {
      // Si no es administrador, aplicar restricciones por bodega
      meterQuery = meterQuery
        .andWhere('warehouse.id IN (:...warehouseIds)', { warehouseIds: user.warehouses.map(warehouse => warehouse.id) });
    }
  
    // Agrega la condición para excluir los materiales eliminados
    meterQuery = meterQuery.andWhere('meter.deletedAt IS NULL');
  
    const meters = await meterQuery.getMany();
  
    return meters;
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
