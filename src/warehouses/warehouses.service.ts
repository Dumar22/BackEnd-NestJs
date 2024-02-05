import { Injectable, BadRequestException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './entities/warehouse.entity';


@Injectable()
export class WarehousesService {

  private readonly logger = new Logger
  static getAllWarehouseIds(id: string) {
      throw new Error('Method not implemented.');
  }

  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {}
  
  async create(createWarehouseDto: CreateWarehouseDto) {
    try {             
      const warehouse= this.warehouseRepository.create(createWarehouseDto);
      await this.warehouseRepository.save(warehouse);

      return {warehouse, message:'Bodega creada'}
      
    } catch (error) {          
      //console.log(error); 
      this.handleDBExeptions(error)
    }
   

  }

  async findAll() {

    //const { limit = 10, offset = 0 } = paginatioDto;
    const warehouse =await this.warehouseRepository.find()
    // return this.warehouseRepository.find({ 
    //   take: limit,
    //   skip: offset,
    // });
    //console.log(warehouse);
 return warehouse
    
  }

 
  async findOne(term: string) {


    const warehouse =await this.warehouseRepository.findOneBy({id: term});

    if (!warehouse)
      throw new NotFoundException(`Bodega no fue encontrado.`);
    return warehouse
  }

  
  async update(id: string, updateWarehouseDto: UpdateWarehouseDto) {
    const warehouse = await this.warehouseRepository.preload({
      id: id,
      ...updateWarehouseDto
    });
      
    if (!warehouse) 
        throw new NotFoundException(`warehouse ${id} not found`);
      
        try {
          await this.warehouseRepository.save(warehouse);
          return warehouse;
   
        } catch (error) {
          this.handleDBExeptions(error)
        }
  }

 async remove(id: string) {
    await this.warehouseRepository.delete({ id });
    return {message:'Bodega eliminada.'}
  }

  private handleDBExeptions(error: any){    

    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException('El código o material ya existe.');
    }

       this.logger.error(error);
            
      throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
