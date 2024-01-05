import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { Tool } from './entities/tool.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { isUUID } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';


@Injectable()
export class ToolsService {

  private readonly logger = new Logger('ToolsService')

  constructor(   
    @InjectRepository( Tool)
    private readonly toolsRepository: Repository<Tool>,

  ){}


  async create(createToolDto: CreateToolDto, user: User) {

    const existingTool = await this.toolsRepository.createQueryBuilder()
    .where('(tool.name = :name OR tool.code = :code) AND warehouseId = :warehouseId', { 
      name: createToolDto.name, 
      code: createToolDto.code,
      warehouseId: user.warehouses[0].id  
    })
    .getOne();
  
      if (existingTool) {
        throw new BadRequestException(`La herramienta ${createToolDto.name} ya existe en la bodega ${user.warehouses[0].name}.`);
      }

    try {   

       const tool = this.toolsRepository.create({
       ...createToolDto,
       user, 
       warehouse: user.warehouses[0]
        
      });

     await this.toolsRepository.save(tool);

      return {herramienta: tool, message:'Herramienta creada'}
      
    } catch (error) {          
      //console.log(error); 
      this.handleDBExeptions(error)
    }
   

  }

  async findAll(paginationDto: PaginationDto, user: User) {
    const { limit = 10, offset = 0 } = paginationDto;
  
    let toolsQuery = this.toolsRepository.createQueryBuilder('tool')
      .leftJoinAndSelect('tool.user', 'user')
      .leftJoinAndSelect('tool.warehouse', 'warehouse');
  
    if (!user.rol.includes('admin')) {
      // Si no es administrador, aplicar restricciones por bodega
      toolsQuery = toolsQuery
        .where('user.id = :userId', { userId: user.id })
        .andWhere('warehouse.id IN (:...warehouseIds)', { warehouseIds: user.warehouses.map(warehouse => warehouse.id) });
    }
    // Agrega la condición para excluir las erramientas eliminados
      toolsQuery = toolsQuery.andWhere('tool.deletedAt IS NULL');
  
    const tools = await toolsQuery
      .skip(offset)
      .take(limit)
      .getMany();
  
    return tools
  }

 async findOne(term: string, user: User) {
   
   let tool: Tool;
     if (isUUID(term)) {
      tool = await this.toolsRepository.findOneBy({id: term});
     }else{      
      const queryBuilder = this.toolsRepository.createQueryBuilder();
      tool = await queryBuilder
       .where('UPPER(name) =:name or code =:code',{
        name: term.toUpperCase(),
        code: term.toLowerCase(),
       }).getOne();
    }    
    if (!tool)
      throw new NotFoundException(`La herramienta no fue encontrada.`);

      return tool;
  }  
  
 async update(id: string, updateToolDto: UpdateToolDto, user: User) {
    
    const tool = await this.toolsRepository.preload({
      id: id,
      ...updateToolDto
    });
      
    const existingTool = await this.toolsRepository.createQueryBuilder()
    .where('(LOWER(tool.name) = LOWER(:name) OR tool.code = :code) AND tool.warehouseId = :warehouseId', {
      name: updateToolDto.name,
      code: updateToolDto.code,
      warehouseId: user.warehouses[0].id
    })
    .andWhere('tool.id != :toolId', { toolId: id })
    .getOne();

  if (existingTool && (existingTool.name !== tool.name || existingTool.code !== tool.code)) {
    throw new BadRequestException(`La herramienta ${updateToolDto.name} ya existe en la bodega ${user.warehouses[0].name}.`);
  }     
        try {
          await this.toolsRepository.save(tool);
          return tool;
   
        } catch (error) {
          this.handleDBExeptions(error)
        }
  }

  async remove(id: string, user: User) {

    const tool = await this.toolsRepository.findOneBy({id: id});

  if (tool) {
    tool.deletedBy = user.id;
    tool.deletedAt = new Date();

    await this.toolsRepository.save(tool);
    // const material = await this.findOne( id );
    //await this.materialsRepository.delete({ id });
    return {message:'Herramienta eliminada.'}
  }else{
    throw new NotFoundException(`La herramienta no fue encontrada.`);
  }
}


  private handleDBExeptions(error: any){    

    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException('El código o Herramienta ya existe.');
    }

       this.logger.error(error);
            
      throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
