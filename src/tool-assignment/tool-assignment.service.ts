import { BadRequestException, Injectable, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ToolAssignment } from './entities/tool-assignment.entity';
import { Repository } from 'typeorm';
import { Collaborator } from 'src/collaborators/entities/collaborator.entity';
import { Tool } from 'src/tools/entities/tool.entity';
import { CreateToolAssignmentDto } from './dto/create-tool-assignment.dto';
import { CreateToolAssignmentDetailDto, UpdateToolAsignamentDto, UpdateToolAssignmentDetailDto } from './dto';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ToolAssignmentDetail } from './entities';

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
    @InjectRepository(ToolAssignmentDetail)
    private readonly toolAssignmentDetailRepository: Repository<ToolAssignmentDetail>,
  ) {}

  async create(createToolAssignmentDTO: CreateToolAssignmentDto, details: CreateToolAssignmentDetailDto[], user: User) {
    
    const { collaboratorId,...rest } = createToolAssignmentDTO;   
    
    //console.log(createToolAssignmentDTO);
    
    // Buscar el colaborador en la base de datos
    const collaborator = await this.collaboratorRepository.findOne({
      where:{id:collaboratorId},
      relations:['warehouse']
    });

    if (!collaborator) {
      throw new NotFoundException('Colaborador no encontrado');
    }   
    
    const ware= collaborator.warehouse.id              
   
   try {   

      // Creamos la instancia de ToolAssignment sin los detalles
      const newToolAssignment = await this.toolAssignmentRepository.create({
        ...rest,
        user,
        collaborator,
        details: details,
        warehouse: user.warehouses[0]
      });
      
      //console.log(newToolAssignment);
      
      // Verificar si todas las herramientas existen y 
    // Actualiza la cantidad de herramientas en el inventario
   await this.verifyToolsExistence(details, ware);    
  
      // Guardar la asignación en la base de datos  
      
    
      
      const detailsWithTools = [];
for (const detail of details) {

  const existingAssignment = await this.toolAssignmentRepository.findOne({
    where: {
      collaborator:  { id: createToolAssignmentDTO.collaboratorId }, 
      details: { tool: {id: detail.toolId} ,
      returnedAt: null },
    }
  });

  console.log(existingAssignment);
  const existingDurability = existingAssignment.details[0].durabilityTool; // Ajusta esto según la estructura exacta de tu entidad

  if (existingAssignment) {
    // Puedes manejar el caso donde la herramienta ya está asignada a este colaborador
    throw new BadRequestException(
      `La herramienta con ID ${detail.toolId} ya está asignada al colaborador. La asignación anterior tiene una duración de ${existingDurability} días.`
    );
  }

  
  const tool = await this.toolRepository.findOneBy({id:detail.toolId});

  

  detailsWithTools.push({
    ...detail,
    tool
  });

}

const savedToolAssignment = await this.toolAssignmentRepository.save(newToolAssignment);

const detailAssignments = [];

for (const detail of detailsWithTools) {

  detailAssignments.push(
    this.toolAssignmentDetailRepository.create({  
      ...detail,
      toolAssignment: savedToolAssignment  
    })
  );

}
 
//console.log('data save',detailAssignments);

await this.toolAssignmentDetailRepository.save(detailAssignments);
  
  
      // Devolver la asignación completa con los detalles asociados
      return detailAssignments
  
      
    } catch (error) {
     // console.log('created',error);
      
      // Manejar las excepciones de la base de datos
      this.handleDBExceptions(error);

    }
 }

  async findOne(id: string,user: User) {
    const toolAssignment = await this.toolAssignmentRepository.findOne({
      where: {id: id},     
        relations: ['collaborator', 'details.tool']      
    });
  
    if (!toolAssignment) {
      throw new NotFoundException(`Asignación de herramienta con ID ${id} no encontrada.`);
    }  
    return toolAssignment;
  }

  async findAll(paginationDto: PaginationDto, user: User) {
    const { limit = 10, offset = 0 } = paginationDto;
  
    let toolAssignmentQuery = this.toolAssignmentRepository.createQueryBuilder('tool_assignment')
      .leftJoinAndSelect('tool_assignment.collaborator', 'collaborator')
      .leftJoinAndSelect('tool_assignment.details', 'details')
      .leftJoinAndSelect('details.tool', 'tool')
      .leftJoinAndSelect('tool_assignment.user', 'user')
      .leftJoinAndSelect('tool_assignment.warehouse', 'warehouse');
  
    if (!user.rol.includes('admin')) {
      // Si no es administrador, aplicar restricciones por bodega
      toolAssignmentQuery = toolAssignmentQuery
        .where('user.id = :userId', { userId: user.id })
        .andWhere('warehouse.id IN (:...warehouseIds)', { warehouseIds: user.warehouses.map(warehouse => warehouse.id) });
    }
    // Agrega la condición para excluir las erramientas eliminados
      toolAssignmentQuery = toolAssignmentQuery.andWhere('tool_assignment.deletedAt IS NULL');
  
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
  
    // // Actualizar la cantidad de herramientas después de la eliminación
    // await this.toolRepository
    //   .createQueryBuilder()
    //   .update(Tool)
    //   .set({ quantity: () => 'quantity + 1' })
    //   //.where('id = :toolId', { toolId: toolAssignment.tool.id })
    //   .execute();
  
    await this.toolAssignmentRepository.delete(id);
  
    return { message: 'Asignación de herramienta eliminada con éxito.' };
  }  

  async update(id: string, updateToolAssignmentDto: UpdateToolAsignamentDto, details: UpdateToolAssignmentDetailDto[], user: User) {

    // 1. Obtener asignación existente
    const toolAssignment = await this.toolAssignmentRepository.findOne({
      where: {id: id},
      relations: ['details', 'details.tool']  
    });
  
    if (!toolAssignment) {
      throw new NotFoundException('Asignación no encontrada');  
    }
  
    // 2. Iterar sobre detalles actualizados
    for(const updatedDetailDto of details) {
  
      // Buscar detalle existente
      const existingDetail = toolAssignment.details.find(d => d.id === updatedDetailDto.id);
  
      if (existingDetail) {
        // Actualizar valores
        existingDetail.assignedQuantity = updatedDetailDto.assignedQuantity;
        existingDetail.observation = updatedDetailDto.observation;
        
        // ...actualizar otros campos
        
      } else {
        // Crear nuevo detalle
        const newDetail = new ToolAssignmentDetail();
        newDetail.tool = await this.toolRepository.findOneBy({id: updatedDetailDto.toolId});
        newDetail.assignedQuantity = updatedDetailDto.assignedQuantity;
        
        // Mapear otros valores
        
        // Agregar al array de detalles
        toolAssignment.details.push(newDetail); 
      }
  
    }
  
    // 3. Guardar y retornar
    await this.toolAssignmentRepository.save(toolAssignment);
    
    return toolAssignment;
  
  }

  private async verifyToolsExistence(details: CreateToolAssignmentDetailDto[], warehouseId: string): Promise<void> {
    try {
      for (const detail of details) {
        const toolId = detail.toolId;
        const assignedQuantity = detail.assignedQuantity;
  
        // Buscar la herramienta en la base de datos
        const tool = await this.toolRepository.findOne({
          where: { id: toolId },
          relations: ['warehouse']
        });
  
        if (!tool) {
          throw new Error(`Herramienta con ID ${toolId} no encontrada`);
        }
  
        // Verificar si la herramienta pertenece a la bodega del colaborador
        if (tool.warehouse.id !== warehouseId) {
          throw new Error(`Herramienta con ID ${toolId} no encontrada en la bodega asignada al colaborador`);
        }
  
        // Verificar si la cantidad asignada es mayor que la cantidad disponible
        if (assignedQuantity > tool.quantity) {
          throw new Error(`La cantidad asignada de la herramienta con ID ${toolId} es mayor que la cantidad disponible`);
        }
  
        // Actualizar la cantidad de la herramienta en el inventario
        await this.toolRepository.decrement(
          { id: toolId },
          'quantity',
          assignedQuantity
        );
        
       
      }
    } catch (error) {
      // Manejar las excepciones de la base de datos
      this.handleDBExceptions(error);
    }
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
    const detailsToUpdate = await this.toolAssignmentDetailRepository.find({
      where: {
        returnedAt: null, // Así solo consideramos los detalles que aún no han sido devueltos
      },
    });

    for (const detail of detailsToUpdate) {
      detail.calculateDurability(); // Asumiendo que la entidad tiene el método calculateDurability
      await this.toolAssignmentDetailRepository.save(detail);
    }
  }
}