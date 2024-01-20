import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as xlsx from 'xlsx';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { CreateMaterialDto } from './dto/create-material.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

import { Material } from './entities/material.entity';
import { validate as isUUID } from 'uuid';
import { User } from 'src/auth/entities/user.entity';
import { FileUploadService } from 'src/upload-xls/upload-xls.service';

@Injectable()
export class MaterialsService {

private readonly logger = new Logger('MaterialsService')

  constructor(   
    @InjectRepository( Material)
    private readonly materialsRepository: Repository<Material>,
    private readonly fileUploadService: FileUploadService

  ){}

  async create(createMaterialDto: CreateMaterialDto, user: User) {

    const existingMaterial = await this.materialsRepository.createQueryBuilder()
    .where('(material.name = :name OR material.code = :code) AND warehouseId = :warehouseId', { 
      name: createMaterialDto.name, 
      code: createMaterialDto.code,
      warehouseId: user.warehouses[0].id  
    })
    .getOne();
  
      if (existingMaterial) {
        throw new BadRequestException(`El material ${createMaterialDto.name} ya existe en la bodega ${user.warehouses[0].name}.`);
      }

    try {   

       const material = this.materialsRepository.create({
       ...createMaterialDto,
       user, 
       warehouse: user.warehouses[0]
        
      });

     await this.materialsRepository.save(material);

      return {material, message:'Material creado'}
      
    } catch (error) {          
      //console.log(error); 
      this.handleDBExeptions(error)
    }
   

  }

  async createxls(fileBuffer: Buffer, createMaterialDto: CreateMaterialDto, user: User) {
    try {
      // Lógica para procesar el archivo Excel y obtener la lista de materiales
      const materials = await this.fileUploadService.processExcel(fileBuffer, this.materialsRepository, (entry: CreateMaterialDto) => {
        return this.materialDataFormat(entry, user);
      });   
        
      // Lista de materiales que no fueron cargados
      const failedMaterials: { material: CreateMaterialDto; reason: string }[] = [];
  
      for (const material of materials) {
        const existingMaterial = await this.materialsRepository.createQueryBuilder()
        .where('(material.name = :name OR material.code = :code) AND warehouseId = :warehouseId', {
          name: material.name,  
          code: material.code,
          warehouseId: user.warehouses[0].id  
        })
    .getOne();
          
    if (existingMaterial) {
      failedMaterials.push({ 
        material, 
        reason: `El material ${material.name} ya existe en la bodega ${user.warehouses[0].name}.` 
      });    
    } else {    
      // Guardar el material solo si no existe
      await this.materialsRepository.save(material);     
    }
      }
  
      return { materials, failedMaterials, message: 'Materiales creados' };
    } catch (error) {
      // console.log(error);
      this.handleDBExeptions(error);
    }
  }
  
  private materialDataFormat(entry: CreateMaterialDto, user: User): Material {
    return this.materialsRepository.create({
      ...entry,
      user,
      warehouse: user.warehouses[0],
    });
  }

  async findAll(paginationDto: PaginationDto, user: User) {
    const { limit = 10, offset = 0 } = paginationDto;
  
    let materialsQuery = this.materialsRepository.createQueryBuilder('material')
      .leftJoinAndSelect('material.user', 'user')
      .leftJoinAndSelect('material.warehouse', 'warehouse');
  
    if (!user.rol.includes('admin')) {
      // Si no es administrador, aplicar restricciones por bodega
      materialsQuery = materialsQuery
        // .where('user.id = :userId', { userId: user.id })
        // .andWhere('warehouse.id IN (:...warehouseIds)', { warehouseIds: user.warehouses.map(warehouse => warehouse.id) });
        .where('warehouse.id IN (:...warehouseIds)', { warehouseIds: user.warehouses.map(warehouse => warehouse.id) });
    }
    // Agrega la condición para excluir los materiales eliminados
      materialsQuery = materialsQuery.andWhere('material.deletedAt IS NULL');
  
    const materials = await materialsQuery
      .skip(offset)
      .take(limit)
      .getMany();
  
    return materials
  }

 async findOne(term: string, user: User) {
   
   let material: Material;
     if (isUUID(term)) {
      material = await this.materialsRepository.findOneBy({id: term});
     }else{
      //material = await this.materialsRepository.findOneBy({name: term});
      const queryBuilder = this.materialsRepository.createQueryBuilder();
      material = await queryBuilder
       .where('UPPER(name) =:name or code =:code',{
        name: term.toUpperCase(),
        code: term.toLowerCase(),
       }).getOne();
    }    
    if (!material)
      throw new NotFoundException(`El material no fue encontrado.`);

      return material;
  }  
  
 async update(id: string, updateMaterialDto: UpdateMaterialDto, user: User) {
    
    const material = await this.materialsRepository.preload({
      id: id,
      ...updateMaterialDto
    });
      
    const existingMaterial = await this.materialsRepository.createQueryBuilder()
    .where('(LOWER(material.name) = LOWER(:name) OR material.code = :code) AND material.warehouseId = :warehouseId', {
      name: updateMaterialDto.name,
      code: updateMaterialDto.code,
      warehouseId: user.warehouses[0].id
    })
    .andWhere('material.id != :materialId', { materialId: id })
    .getOne();

  if (existingMaterial && (existingMaterial.name !== material.name || existingMaterial.code !== material.code)) {
    throw new BadRequestException(`El material ${updateMaterialDto.name} ya existe en la bodega ${user.warehouses[0].name}.`);
  }

      
        try {
          await this.materialsRepository.save(material);
          return material;
   
        } catch (error) {
          this.handleDBExeptions(error)
        }
  }

  async remove(id: string, user: User) {

    const material = await this.materialsRepository.findOneBy({id: id});

  if (material) {
    material.code = material.code+'XX'
    material.deletedBy = user.id;
    material.deletedAt = new Date();

    await this.materialsRepository.save(material);
    // const material = await this.findOne( id );
    //await this.materialsRepository.delete({ id });
    return {message:'Material eliminado.'}
  }else{
    throw new NotFoundException(`El material no fue encontrado.`);
  }
}

  private handleDBExeptions(error: any){    

    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException('El código o material ya existe.');
    }

       this.logger.error(error);
            
      throw new InternalServerErrorException('Unexpected error, check server logs');
  }
  
}


