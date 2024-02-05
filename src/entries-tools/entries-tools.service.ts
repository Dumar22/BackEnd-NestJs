import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import *as moment from 'moment-timezone';
import { CreateEntriesToolDto } from './dto/create-entries-tool.dto';
import { UpdateEntriesToolDto } from './dto/update-entries-tool.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntriesTool } from './entities/entries-tool.entity';
import { Like, Repository } from 'typeorm';
import { FileUploadService } from 'src/upload-xls/upload-xls.service';
import { DetailsEntriesTools } from './entities/entries-tool-details.entity';
import { Tool } from 'src/tools/entities/tool.entity';
import { CreateDetailDto } from './dto/create-details-entries.dto';
import { User } from 'src/auth/entities/user.entity';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as currencyFormatter from 'currency-formatter';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { logoBase64 } from 'src/common/helpers/logo-base64';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';
import { UpdateDetailToolDto } from './dto/update-details-entries.dto';

moment.tz.setDefault("America/Bogota");

@Injectable()
export class EntriesToolsService {

  private readonly logger = new Logger('EntriesService')

  constructor(   
    @InjectRepository( EntriesTool)
    private readonly entriesRepository: Repository<EntriesTool>,  
    private readonly fileUploadService: FileUploadService,
    @InjectRepository( DetailsEntriesTools)
    private readonly detailsEntryRepository: Repository<DetailsEntriesTools>,
    @InjectRepository( Tool)
    private readonly toolRepository: Repository<Tool>,
    

  ){}


  async create(createEntryDto: CreateEntriesToolDto, createDetailDto: CreateDetailDto[], user: User) {
    // Verificar si ya existe una entrada con el mismo número en la misma bodega
    const existingEntry = await this.entriesRepository.createQueryBuilder('entry')
      .where('entry.entryNumber = :entryNumber AND warehouseId = :warehouseId', {
        entryNumber: createEntryDto.entryNumber,
        warehouseId: user.warehouses[0].id,
      })
      .getOne();
  
    if (existingEntry) {
      throw new BadRequestException(`La entrada ${createEntryDto.entryNumber} ya existe en la bodega ${user.warehouses[0].name}.`);
    }
  
    try {
      // Crear la entrada
      const entry = await this.entriesRepository.create({
        ...createEntryDto,        
        user,
        warehouse: user.warehouses[0],
        details: createDetailDto
      });

      // Actualizar materiales y medidores
     await this.updateToolsDetails(entry);

      // Guardar la entrada en la base de datos
      const savedEntry = await this.entriesRepository.save(entry,);

      // Crear los detalles de materiales y asociarlos a la entrada
      const materialDetails = createDetailDto.map((materialDetail) => {
        const materialEntry = this.detailsEntryRepository.create({
          ...materialDetail,
          entryTool: savedEntry, // Asociar el detalle a la entrada recién creada
        });
        return materialEntry;
      });

      // Guardar los detalles de materiales en la base de datos
      await this.detailsEntryRepository.save(materialDetails);          

      return { entry: savedEntry, message: 'Entrada creada' };
    } catch (error) {
      //console.log(error);      
      // Manejar las excepciones de la base de datos
      this.handleDBExceptions(error);
    }
  }  

  async createEntryFromExcel(createEntryDto: CreateEntriesToolDto, user: User, fileBuffer: Buffer) {
    try {
      // Lógica para procesar el archivo Excel y obtener los detalles de la entrada
      const entryDetails = await this.fileUploadService.processExcel(fileBuffer, this.detailsEntryRepository, (entry: any) => {
        return this.formatEntryDetail(entry, user);
      });
  
      // Verificar si ya existe una entrada con el mismo número en la misma bodega
      const existingEntry = await this.entriesRepository.createQueryBuilder('entry')
        .where('entry.entryNumber = :entryNumber AND warehouseId = :warehouseId', {
          entryNumber: createEntryDto.entryNumber,
          warehouseId: user.warehouses[0].id,
        })
        .getOne();
  
      if (existingEntry) {
        throw new BadRequestException(`La entrada ${createEntryDto.entryNumber} ya existe en la bodega ${user.warehouses[0].name}.`);
      }
  
      // Crear la entrada con los detalles obtenidos del archivo de Excel
      const entry = await this.entriesRepository.create({
        ...createEntryDto,        
        user,
        warehouse: user.warehouses[0],
        details: entryDetails
      });
  
      // Actualizar materiales y medidores
      await this.updateToolsDetails(entry);
  
      // Guardar la entrada en la base de datos
      const savedEntry = await this.entriesRepository.save(entry);

      // Crear los detalles de materiales y asociarlos a la entrada
      const materialDetails = entryDetails.map((materialDetail) => {
        const materialEntry = this.detailsEntryRepository.create({
          ...materialDetail,
          entryTool: savedEntry, // Asociar el detalle a la entrada recién creada
        });
        return materialEntry;
      });

      // Guardar los detalles de materiales en la base de datos
      await this.detailsEntryRepository.save(materialDetails); 
  
      return { entry: savedEntry, message: 'Entrada creada desde Excel' };
    } catch (error) {
      console.log(error);
      this.handleDBExceptions(error);
    }
  }
     
  private formatEntryDetail(entry: CreateDetailDto, user: User): DetailsEntriesTools {
    // Lógica para formatear los detalles de la entrada según sea necesario    // ...
      return this.detailsEntryRepository.create({
      ...entry,
    });
  }  

  async updateToolsDetails(entry: EntriesTool) {
    
    
    try {
      for (const detail of entry.details) {
        // Obtener el material existente
  const existingTool = await this.toolRepository.findOneBy({ code: detail.code });
  
        if (existingTool) {
          // Actualizar la cantidad en cualquier caso
          await this.toolRepository.update(
            { code: detail.code },
            {
              quantity: () => `quantity + ${detail.quantity}`,
            }
          );
        
          // Verificar si el nuevo precio es mayor al existente
          if (detail.price > existingTool.price) {
            // Actualizar el precio solo si es mayor
            await this.toolRepository.update(
              { code: detail.code },
              { price: detail.price }
            );
          }
        }
  
      }
    } catch (error) {
      // Propagar la excepción
      throw new Error(error);
    }
  } 
  
  async generarPDF(id: string, user: User): Promise<Buffer> {
    const entryData = await this.entriesRepository.findOneBy({id: id});
    
    if (!entryData) {
      throw new NotFoundException('Entrada no encontrada');
    }

    const formattedDate = moment(entryData.date).format('DD/MM/YYYY HH:mm');
  
    // Calcular el total de los detalles del traslado
    const totalMat = entryData.details.reduce((acc, detail) => acc + (detail.total), 0);
    const totalFormatted = currencyFormatter.format(totalMat, { code: 'COP' });

    entryData.details.forEach((detail) => {
      detail.price = currencyFormatter.format(detail.price, { code: 'USD' }); // Cambia 'USD' según tu moneda
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
        { text: 'ENTRADA DE HERRAMIENTAS', fontSize: 14, alignment: 'center', margin: [0, 15, 0, 35] },
        {
          columns: [
            // Datos a la izquierda
            [
              { text: 'Fecha de la entrada: ' + formattedDate, fontSize: 10 },
              { text: 'Número de entrada: ' + entryData.entryNumber, fontSize: 10 },
              { text: 'Origen: ' + entryData.origin, fontSize: 10 },
            
            ],
            [
              { text: 'Nit: ' + entryData.origin, fontSize: 10 },
              { text: 'Provedor: ' + entryData.providerName, fontSize: 10, margin: [0, 0, 0, 20] }
              
            ],
          ],
        },
        // ... Otros detalles según sea necesario
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Código', style: 'tableHeader' },
                { text: 'Material', style: 'tableHeader' },
                { text: 'Unidad', style: 'tableHeader' },
                { text: 'Serial', style: 'tableHeader' },
                { text: 'Marca', style: 'tableHeader' },
                { text: 'Cantidad', style: 'tableHeader' },
                { text: 'Precio unidad', style: 'tableHeader' },
                { text: 'Total', style: 'tableHeader' },
              ],
              // Agrega filas con los detalles del traslado
              ...entryData.details.map((detail) => [
                {text: detail.code, alignment: 'center', fontSize: 8},
                 {text: detail.name, alignment: 'center', fontSize: 8}, 
                {text: detail.unity, alignment: 'center', fontSize: 8},
                {text: detail.serial, alignment: 'center', fontSize: 8},
                {text: detail.brand, alignment: 'center', fontSize: 8},
                { text: detail.quantity, alignment: 'center',fontSize: 9 }, // Centrar la cantidad
                {text: detail.price, alignment: 'center', fontSize: 9},
                {text: detail.total, alignment: 'center', fontSize: 9}
              ]),
              ['', '','', '', '', '', { text: 'Total', style: 'tableHeader' }, {text: totalFormatted, style: 'tableHeader'}],
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
      ],
      styles :{
        tableHeader: {
          bold: true,
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

  async findAll(paginationDto: PaginationDto, user: User) {
    const { limit = 10, offset = 0 } = paginationDto;
  
    let entriesQuery = this.entriesRepository.createQueryBuilder('entry')
      .leftJoinAndSelect('entry.details', 'details')
      .leftJoinAndSelect('entry.user', 'user')
      .leftJoinAndSelect('entry.warehouse', 'warehouse');
  
    if (!user.rol.includes('admin')) {
      // Si no es administrador, aplicar restricciones por bodega
      entriesQuery = entriesQuery
        // .andWhere('user.id = :userId', { userId: user.id })
        .andWhere('warehouse.id IN (:...warehouseIds)', { warehouseIds: user.warehouses.map(warehouse => warehouse.id) });
    }
    // Agrega la condición para excluir las erramientas eliminados
      entriesQuery = entriesQuery.andWhere('entry.deletedAt IS NULL');
  
    const entries = await entriesQuery
      .skip(offset)
      .take(limit)
      .getMany();
  
    return entries
  }

  async findOne(term: string, user: User) {
    let entry: EntriesTool;
  
    if (isUUID(term)) {
      entry = await this.entriesRepository.findOne({
        where: [{id: term}],
          relations: ['details'],
         });
    } else {
      entry = await this.entriesRepository.findOne({
        where: [
          { providerName: term },
          { entryNumber: term },
          // Añade otras propiedades según sea necesario para tu búsqueda
        ],
        relations: ['details'],
      });
    }
  
    if (!entry) {
      throw new NotFoundException(`La entrada no fue encontrada.`);
    }
  
    return entry;
  }

  async searchEntry(term: string, user: User) {
    let data = await this.entriesRepository.find({
      where: [
        { entryNumber: Like(`%${term}%`) },
        { providerName: Like(`%${term}%`) },
        { origin: Like(`%${term}%`) },
        
      ],
    });
    return data;
  }
  
  async update(id: string, updateEntryDto: UpdateEntriesToolDto, updateDetailDto: UpdateDetailToolDto[], user: User) {

    const existingEntry = await this.entriesRepository.findOneBy({id: id});
  
    if (!existingEntry) 
      throw new NotFoundException(`Entrada con ID ${id} no encontrada.`);   
           
  
    // Actualizar la entrada con los datos proporcionados en updateEntryDto
    this.entriesRepository.merge(existingEntry, updateEntryDto);  
  
    // Actualizar los detalles de la entrada
    const updatedDetails = updateEntryDto.createDetailDto.map(updateDetail => {
      const existingDetail = existingEntry.details.find(detail => detail.id === updateDetail.id);
      
      if (existingDetail) {
        // El detalle existe, por lo que se actualiza
        this.detailsEntryRepository.merge(existingDetail, updateDetail);
        return existingDetail;
      } else {
        // El detalle no existe, por lo que se crea como un nuevo detalle
        const newDetail = this.detailsEntryRepository.create(updateDetail);
        existingEntry.details.push(newDetail);
        return newDetail;
      }
    });
    

  try {
    
    // Actualizar materiales y medidores   
    await this.updateToolsDetails(existingEntry);
    // Guardar los cambios en la base de datos
    await this.entriesRepository.save(existingEntry);
    await this.detailsEntryRepository.save(updatedDetails);   
  
    return { entry: existingEntry, message: 'Entrada actualizada con éxito.' };
  } catch (error) {
     // Manejar las excepciones de la base de datos
     this.handleDBExceptions(error);
  }
  }

  async remove(id: string, user: User) {

    const entry = await this.entriesRepository.findOneBy({id: id});

  if (entry) {
    entry.deletedBy = user.id;
    entry.deletedAt = new Date();
    entry.entryNumber = 'XXXX-XX'

    await this.entriesRepository.save(entry);
    // const material = await this.findOne( id );
    //await this.materialsRepository.delete({ id });
    return {message:'Entrada eliminada.'}
  }else{
    throw new NotFoundException(`La entrada no fue encontrado.`);
  }
}
  private handleDBExceptions(error: any){    

    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException('La entrada ya existe.');
    }

    if (error instanceof Error) {
      // Capturar y manejar errores específicos lanzados con el mensaje deseado
     // console.error(error.message);
      throw new BadRequestException(error.message);
    }

       this.logger.error(error);
            
      throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
