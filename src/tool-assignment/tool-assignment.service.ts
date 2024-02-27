import { BadRequestException, Injectable, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import * as moment from 'moment-timezone';
import { InjectRepository } from '@nestjs/typeorm';
import { ToolAssignment } from './entities/tool-assignment.entity';
import {  Repository } from 'typeorm';
import { Collaborator } from 'src/collaborators/entities/collaborator.entity';
import { Tool } from 'src/tools/entities/tool.entity';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateToolAssignmentDto, UpdateToolAsignamentDto } from './dto';
import { CreateToolAssignmentDetailsDto } from './dto/create-tool-assignment.dto';
import { ToolAssignmentDetails } from './entities';
import { UpdateToolAssignmentDetailsDto } from './dto/update-tool-assignment.dto';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as currencyFormatter from 'currency-formatter';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { logoBase64 } from 'src/common/helpers/logo-base64';


moment.tz.setDefault("America/Bogota");
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
    @InjectRepository(ToolAssignmentDetails)
    private readonly toolAssignmentDetailsRepository: Repository<ToolAssignmentDetails>,
  ) { pdfMake.vfs = pdfFonts.pdfMake.vfs;}

  async create(createToolAssignmentDTO: CreateToolAssignmentDto, details: CreateToolAssignmentDetailsDto[], user: User) {
  
    const { collaboratorId, ...rest } = createToolAssignmentDTO;   
    
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
 const newToollAssignment = await this.toolAssignmentRepository.create({
  ...rest,
  user,
  collaborator,
   details,
  warehouse: user.warehouses[0]
});                
      //console.log(newMaterialAssignment);
      
      // Verificar si todas las herramientas existen y 
    // Actualiza la cantidad de herramientas en el inventario
   await this.verifyToolsExistence(details, ware);    
  
      // Guardar la asignación en la base de datos      
      
      const detailsWithTools = [];
for (const detail of details) {
  
  const tool = await this.toolRepository.findOneBy({id: detail.toolId });
  detailsWithTools.push({
    ...detail,
       tool
  });  
} 

const savedtoolAssignment = await this.toolAssignmentRepository.save(newToollAssignment);

const detailAssignments = [];

for (const detail of detailsWithTools) {
detailAssignments.push(
  this.toolAssignmentDetailsRepository.create({
    ...detail,
    assignmentDetails: savedtoolAssignment
  })
);
}


await this.toolAssignmentDetailsRepository.save(detailAssignments);
  
  
      // Devolver la asignación completa con los detalles asociados
      return {message:'Asignación creada correctamente.'};
  
      
    } catch (error) {
     // console.log('created',error);
      
      // Manejar las excepciones de la base de datos
      this.handleDBExceptions(error);

    }
 }
  

  async findOne(id: string,user: User) {
    const toolAssignment = await this.toolAssignmentRepository.findOne({
      where: {id: id},     
        relations: ['collaborator', 'details', 'details.tool']      
    });
  
    if (!toolAssignment) {
      throw new NotFoundException(`Asignación de herramienta con ID ${id} no encontrada.`);
    }  
    return toolAssignment;
  }

  async findAll(paginationDto: PaginationDto, user: User) {
    // const { limit = 10, offset = 0 } = paginationDto;
  
    let toolAssignmentQuery = this.toolAssignmentRepository.createQueryBuilder('tool-assignment')
      .leftJoinAndSelect('tool-assignment.collaborator', 'collaborator')
      .leftJoinAndSelect('tool-assignment.user', 'user')
      .leftJoinAndSelect('tool-assignment.warehouse', 'warehouse')
      .leftJoinAndSelect('tool-assignment.details', 'details')  
      .leftJoinAndSelect('details.tool', 'tool');

  
    if (!user.rol.includes('admin')) {
      // Si no es administrador, aplicar restricciones por bodega
      toolAssignmentQuery = toolAssignmentQuery
        // .andWhere('user.id = :userId', { userId: user.id })
        .andWhere('warehouse.id IN (:...warehouseIds)', { warehouseIds: user.warehouses.map(warehouse => warehouse.id) });
    }
    // Agrega la condición para excluir las herramientas eliminados
      toolAssignmentQuery = toolAssignmentQuery.andWhere('tool-assignment.deletedAt IS NULL');
  
    const toolassignment = await toolAssignmentQuery
      // .skip(offset)
      // .take(limit)
      .getMany();
  
    return  toolassignment
  }

  async searchToolAssignment(term: string, user: User) {
    let data = await this.toolAssignmentRepository.createQueryBuilder('tool_assignment')
    .leftJoinAndSelect('tool_assignment.collaborator', 'collaborator')
    .where('collaborator.name LIKE :term OR tool_assignment.reason LIKE :term', { term: `%${term}%` })
    .getMany();
    return data;
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


  async generarPDF(id: string, user: User): Promise<Buffer> {
    const entryData = await this.toolAssignmentRepository.findOneBy({id: id});
    
    if (!entryData) {
      throw new NotFoundException('Asignación no encontrada');
    }

    const formattedDate = moment(entryData.assignedAt).format('DD/MM/YYYY HH:mm');
  
    // Calcular el total de los detalles del traslado
    const totalMat = entryData.details.reduce((acc, detail) => acc + (detail.total), 0);
    const totalFormatted = currencyFormatter.format(totalMat, { code: 'COP' });

    entryData.details.forEach((detail) => {          
      detail.tool.price = currencyFormatter.format(detail.tool.price, { code: 'USD' }); // Cambia 'USD' según tu moneda
      detail.total = currencyFormatter.format(detail.total, { code: 'USD' }); // Cambia 'USD' según tu moneda
    });

    const pdfDefinition = {
      pageSize: 'letter', //legal
    pageMargins: [40, 40, 40, 40],
      header: {
        image: logoBase64,
        fit: [100, 100],
        alignment: 'left',
        margin: [40, 20],
      },
      content: [
        { text: 'ASIGNACION DE HERRAMIENTAS', fontSize: 14, alignment: 'center', margin: [0, 15, 0, 35] },
        {
          columns: [
            // Datos a la izquierda
            [
              { text: 'Fecha de la asignación: ' + formattedDate, fontSize: 9 },
              { text: 'Responsable: ' + entryData.collaborator.name, fontSize: 9 },
              { text: 'cargo: ' + entryData.collaborator.operation, fontSize: 9, },
              { text: 'Documento: ' + entryData.collaborator.document, fontSize: 9, margin: [0, 0, 0, 20] },
            
            ],
            
          ],
        },
        // ... Otros detalles según sea necesario
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', 'auto', 'auto', ],
            body: [
              [
                { text: 'Código', style: 'tableHeader' },
                { text: 'Herramienta', style: 'tableHeader' },
                { text: 'Unidad', style: 'tableHeader' },
                { text: 'Cantidad', style: 'tableHeader' },
                
                
              ],
              // Agrega filas con los detalles del traslado
              ...entryData.details.map((detail) => [
                {text: detail.tool.code, alignment: 'center', fontSize: 6},
                 {text: detail.tool.name, alignment: 'center', fontSize: 6}, 
                {text: detail.tool.unity, alignment: 'center', fontSize: 6},
                
                
                { text: detail.assignedQuantity, alignment: 'center',fontSize: 6 }, // Centrar la cantidad
               
                
              ]),
              ['', '','', ''],
              // ['', '','', '', { text: 'Total', style: 'tableHeader' }, {text: totalFormatted, style: 'tableHeader'}],
            ],
            layout: {
              defaultBorder: false, // Deshabilita los bordes por defecto
              hLineWidth: function(i, node) { return (i === 0 || i === node.table.body.length) ? 1 : 0; }, // Establece el ancho de línea horizontal
              vLineWidth: function(i, node) { return 0; }, // Deshabilita las líneas verticales
              hLineColor: function(i, node) { return 'black'; }, // Establece el color de línea horizontal
              paddingTop: function(i, node) { return 5; }, // Añade relleno superior a todas las celdas
              paddingBottom: function(i, node) { return 5; }, // Añade relleno inferior a todas las celdas
            },
            margin: [0, 10], // Establece el margen de la tabla
          },
        },
        { text: 'Observaciones: ' + entryData.observation, fontSize: 9, margin: [0, 20] },
        {
          columns: [
            { text: 'Firma Jefe de Bodega:__________________________', alignment: 'left' ,fontSize: 8, margin: [0, 40] },
            { text: 'Firma del Responsable: _________________________', fontSize: 8, margin: [0, 40] },
          ],
        },
      ],
      styles :{
        tableHeader: {
          bold: true,
          fontSize: 8,
          fillColor: '#F5F5F5',
          alignment: 'center',
        },
      }
    };
    
    
     

    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      const pdfDocGenerator = pdfMake.createPdf(pdfDefinition);
      pdfDocGenerator.getBuffer((buffer) => {
        resolve(buffer);
      });
    });

    return pdfBuffer;
  }

  async update(id: string, updateToolAssignmentDto: UpdateToolAsignamentDto, details: UpdateToolAssignmentDetailsDto[], user: User) {

    const existingAssignment = await this.toolAssignmentRepository.findOneBy({id: id})

    if (!existingAssignment) {
      throw new NotFoundException(`Assignación con ID ${id} no encontrada.`);
    }
    
    try {
      // Actualizar los campos de la asignación
      await this.toolAssignmentRepository.merge( existingAssignment, updateToolAssignmentDto);

      // Actualizar los detalles de la asignación
      const updatedDetails = [];
      for (const detail of details) {
          const existingDetail = await this.toolAssignmentDetailsRepository.findOneBy({ id: detail.id });
          if (existingDetail) {
              // Actualizar los campos de los detalles de la asignación
              await this.toolAssignmentDetailsRepository.merge(existingDetail, detail );

              updatedDetails.push(detail);
          }
      }

      return { assignment: existingAssignment, details: updatedDetails };
  } catch (error) {
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

  private async verifyToolsExistence(details: CreateToolAssignmentDetailsDto[], warehouseId: string): Promise<void> {
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
          throw new Error(`Herramienta con ID ${toolId} no encontrado`);
        }
  
        // Verificar si la herramienta pertenece a la bodega del colaborador
        if (tool.warehouse.id !== warehouseId) {
          throw new Error(`Material con ID ${toolId} no encontrada en la bodega asignada al colaborador`);
        }
  
        // Verificar si la cantidad asignada es mayor que la cantidad disponible
        if (assignedQuantity > tool.quantity) {
          throw new Error(`La cantidad asignada del material con ID ${toolId} es mayor que la cantidad disponible`);
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
  
}