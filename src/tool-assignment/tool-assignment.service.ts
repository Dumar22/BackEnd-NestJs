import { BadRequestException, Injectable, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ToolAssignment } from './entities/tool-assignment.entity';
import { Repository } from 'typeorm';
import { Collaborator } from 'src/collaborators/entities/collaborator.entity';
import { Tool } from 'src/tools/entities/tool.entity';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateToolAssignmentDto, UpdateToolAsignamentDto } from './dto';

@Injectable()
export class ToolAssignmentService {

  private readonly logger = new Logger('ToolAssignmentService')


  constructor(
    @InjectRepository(Collaborator)
    private readonly collaboratorRepository: Repository<Collaborator>,
    @InjectRepository(Tool)
    private readonly toolRepository: Repository<Tool>,
    @InjectRepository(ToolAssignment)
    private readonly toolAssignmentRepository: Repository<ToolAssignment>,
  ) {}

  async create(createToolAssignmentDTO: CreateToolAssignmentDto, user: User) {
    
    const { collaboratorId,toolId,...rest } = createToolAssignmentDTO;   
    
    
    
    // Buscar el colaborador en la base de datos
    const collaborator = await this.collaboratorRepository.findOne({
      where:{id:collaboratorId},
      relations:['warehouse']
    });

    if (!collaborator) {
      throw new NotFoundException('Colaborador no encontrado');
    }   
    
    // Buscar el herramienta en la base de datos
    const tool = await this.toolRepository.findOne({
      where:{id:toolId},
      relations:['warehouse']
    });

    if (!tool) {
      throw new NotFoundException('Herramienta no encontrada');
    }   
    if (tool.quantity < createToolAssignmentDTO.assignedQuantity) {
      throw new NotFoundException('La cantidad de asignacion es mayor a la cantidad de existencia, por favor revisar');
    }   

     // Actualizar la cantidad de la herramienta en el inventario
     await this.toolRepository.decrement(
      { id: toolId },
      'quantity',
      createToolAssignmentDTO.assignedQuantity
    );        
   
   try {
     // Creamos la instancia de ToolAssignment sin los detalles
     const newToolAssignment = await this.toolAssignmentRepository.create({
       ...createToolAssignmentDTO,
       collaborator,
       tool,
       warehouse: user.warehouses[0],
       user,
     });

     // Guardar la asignación en la base de datos
     const savedToolAssignment =
       await this.toolAssignmentRepository.save(newToolAssignment);

     // Devolver la asignación completa con los detalles asociados
     return { assignment: savedToolAssignment, message: 'Assignación creada' };
   } catch (error) {
     // console.log('created',error);

     // Manejar las excepciones de la base de datos
     this.handleDBExceptions(error);
   }
 }

  async findOne(id: string,user: User) {
    const toolAssignment = await this.toolAssignmentRepository.findOne({
      where: {id: id},     
        relations: ['collaborator', 'tool']      
    });
  
    if (!toolAssignment) {
      throw new NotFoundException(`Asignación de herramienta con ID ${id} no encontrada.`);
    }  
    return toolAssignment;
  }

  async findAll(paginationDto: PaginationDto, user: User) {
    const { limit = 10, offset = 0 } = paginationDto;
  
    let toolAssignmentQuery = this.toolAssignmentRepository.createQueryBuilder('tool-assignment')
      .leftJoinAndSelect('tool-assignment.collaborator', 'collaborator')
      .leftJoinAndSelect('tool-assignment.tool', 'tool')     
      .leftJoinAndSelect('tool-assignment.user', 'user')
      .leftJoinAndSelect('tool-assignment.warehouse', 'warehouse');

      
      
  
    if (!user.rol.includes('admin')) {
      // Si no es administrador, aplicar restricciones por bodega
      toolAssignmentQuery = toolAssignmentQuery
        // .where('user.id = :userId', { userId: user.id })
        .where('warehouse.id IN (:...warehouseIds)', { warehouseIds: user.warehouses.map(warehouse => warehouse.id) });
    }
    // Agrega la condición para excluir las herramientas eliminados
      toolAssignmentQuery = toolAssignmentQuery.andWhere('tool-assignment.deletedAt IS NULL');
  
    const toolassignment = await toolAssignmentQuery
      .skip(offset)
      .take(limit)
      .getMany();
  
    return  toolassignment
  }

  async remove(id: string, user: User) {
    const toolAssignment = await this.toolAssignmentRepository.findOneBy({id: id});
  
    if (!toolAssignment) {
      throw new NotFoundException(`Asignación de herramienta con ID ${id} no encontrada.`);
    }

    toolAssignment.deletedBy = user.id;
    toolAssignment.deletedAt = new Date();

    await this.toolAssignmentRepository.save(toolAssignment);
    
    return {message: 'Asignación de herramienta eliminada con éxito.'}
  
  }  

  async update(id: string, updateToolAssignmentDto: UpdateToolAsignamentDto, user: User) {

    const toolAssignment = await this.toolAssignmentRepository.preload({
      id: id,
      ...updateToolAssignmentDto
    });

    const toolID = updateToolAssignmentDto.toolId
    // // 1. Obtener asignación existente
    // const toolAssignment = await this.toolAssignmentRepository.findOne({
    //   where: {id: id},
    //   relations: ['tool', 'collaborator']  
    // });
  
    if (!toolAssignment) {
      throw new NotFoundException('Asignación no encontrada');  
    }

     // Buscar el herramienta en la base de datos
     const toolExist = await this.toolRepository.findOne({
      where:{id:toolID},
      relations:['warehouse']
    });

    if (!toolExist) {
      throw new NotFoundException('Herramienta no encontrada');
    }   
    if (toolExist.quantity <updateToolAssignmentDto.assignedQuantity) {
      throw new NotFoundException('La cantidad de asignacion es mayor a la cantidad de existencia, por favor revisar');
    }   

     // Actualizar la cantidad de la herramienta en el inventario
     await this.toolRepository.decrement(
      { id: toolID },
      'quantity',
      updateToolAssignmentDto.assignedQuantity
    );       
  
  
    // 3. Guardar y retornar
    await this.toolAssignmentRepository.save(toolAssignment);
    
    return toolAssignment;
  
  }

  private handleDBExceptions(error: any){    

    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException('La entrada ya existe.');
    }

    if (error instanceof Error) {
      // Capturar y manejar errores específicos lanzados con el mensaje deseado
     //console.error('error-message',error.message);
      throw new BadRequestException(error.message);
    }

       this.logger.error(error);
            
      throw new InternalServerErrorException('Unexpected error, check server logs');
  }


  async updateDurability(): Promise<void> {
    const detailsToUpdate = await this.toolAssignmentRepository.find({
      where: {
        returnedAt: null, // Así solo consideramos los detalles que aún no han sido devueltos
      },
    });

    for (const detail of detailsToUpdate) {
      detail.calculateDurability(); // Asumiendo que la entidad tiene el método calculateDurability
      await this.toolAssignmentRepository.save(detail);
    }
  }
}