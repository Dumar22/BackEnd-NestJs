import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateDetailDto, CreateEntryDto, UpdateDetailDto, UpdateEntryDto } from './dto';
import { User } from 'src/auth/entities/user.entity';
import { DetailsEntry, Entry } from './entities';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';
import { Material } from 'src/materials/entities/material.entity';
import { Meter } from 'src/meters/entities/meter.entity';
import { FileUploadService } from 'src/upload-xls/upload-xls.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as currencyFormatter from 'currency-formatter';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { logoBase64 } from 'src/common/helpers/logo-base64';
import *as moment from 'moment-timezone';
import { Tool } from 'src/tools/entities/tool.entity';

moment.tz.setDefault("America/Bogota");


@Injectable()
export class EntriesService {
  
  private readonly logger = new Logger('EntriesService')

  constructor(   
    @InjectRepository( Entry)
    private readonly entriesRepository: Repository<Entry>,  
    private readonly fileUploadService: FileUploadService,
    @InjectRepository( DetailsEntry)
    private readonly detailsEntryRepository: Repository<DetailsEntry>,
    @InjectRepository( Material)
    private readonly materialRepository: Repository<Material>,
    @InjectRepository( Tool)
    private readonly toolRepository: Repository<Tool>,    
    @InjectRepository( Meter)
    private readonly meterRepository: Repository<Meter>,

  ){}

  async create(createEntryDto: CreateEntryDto, createDetailDto: CreateDetailDto[], user: User) {
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
     await this.updateMaterialAndMeterDetails(entry);

      // Guardar la entrada en la base de datos
      const savedEntry = await this.entriesRepository.save(entry,);

      // Crear los detalles de materiales y asociarlos a la entrada
      const materialDetails = createDetailDto.map((materialDetail) => {
        const materialEntry = this.detailsEntryRepository.create({
          ...materialDetail,
          entry: savedEntry, // Asociar el detalle a la entrada recién creada
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

  async createEntryFromExcel(createEntryDto: CreateEntryDto, user: User, fileBuffer: Buffer) {
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
  
     /*  console.log(entry); */
      
      // Actualizar materiales y medidores
      await this.updateMaterialAndMeterDetails(entry);
  
      // Guardar la entrada en la base de datos
      const savedEntry = await this.entriesRepository.save(entry);

      // Crear los detalles de materiales y asociarlos a la entrada
      const materialDetails = entryDetails.map((materialDetail) => {
        const materialEntry = this.detailsEntryRepository.create({
          ...materialDetail,
          entry: savedEntry, // Asociar el detalle a la entrada recién creada
        });
        return materialEntry;
      });

      // Guardar los detalles de materiales en la base de datos
      await this.detailsEntryRepository.save(materialDetails); 
  
      return { entry: savedEntry, message: 'Entrada creada desde Excel' };
    } catch (error) {
      //console.log(error);
      this.handleDBExceptions(error);
    }
  }
     
  private formatEntryDetail(entry: CreateDetailDto, user: User): DetailsEntry {
    // Lógica para formatear los detalles de la entrada según sea necesario    // ...
      return this.detailsEntryRepository.create({
      ...entry,
    });
  }  

  async updateMaterialAndMeterDetails(entry: Entry) {
    

    try {
      for (const detail of entry.details) {
    
        if (!detail) {
         // console.log('Detalle indefinido:', detail);
          continue; // O manejar este caso de acuerdo a tu lógica
        }
        
        // Obtener el material existente
        const existingMaterial = await this.materialRepository.createQueryBuilder('material')
        .where('material.code = :code', { code: detail.code })
        .getOne();
    
        if (detail.observation === "") {
          throw new Error(`El material o herramienta a ingresar no tiene observación MATERIAL/HERRAMIENTA, por favor agregarla`);  
        }
       
        
        if (detail.observation.startsWith("HERRAMIENTA")) {
         

            const existingTool = await this.toolRepository.createQueryBuilder('tool')
        .where('tool.code = :code', { code: detail.code })
        .getOne();

            if (existingTool) {
              // Actualizar la cantidad en cualquier caso
              await this.toolRepository.createQueryBuilder()
            .update(Tool)
            .set({
                quantity: () => `quantity + ${detail.quantity}`,
                total: () => `total + ${detail.total}`
            })
            .where("code = :code AND warehouseId = :warehouseId", { code: detail.code, warehouseId: entry.warehouse.id })
            .execute();
          
            if (detail.price ) {
              // Actualizar el precio solo si es mayor en la bodega actual
              await this.materialRepository.createQueryBuilder()
                  .update(Material)
                  .set({ price: detail.price })
                  .where("code = :code AND warehouseId = :warehouseId", { code: detail.code, warehouseId: entry.warehouse.id })
                  .execute();
                    
                  }
            if (detail.iva ) {
              // Actualizar el IVA en la bodega actual
              await this.materialRepository.createQueryBuilder()
                  .update(Material)
                  .set({ iva: detail.iva })
                  .where("code = :code AND warehouseId = :warehouseId", { code: detail.code, warehouseId: entry.warehouse.id })
                  .execute();
                    
                  }
          }else{
            // Si no existe , agregar
          const newTool = this.toolRepository.create({
            ...detail,
            warehouse: entry.warehouse, // Asignar la bodega de la entrada
            user: entry.user,
          });
          await this.toolRepository.save(newTool);
          }
          
          
          
        }
  
        if (existingMaterial) {
          // Actualizar la cantidad en cualquier caso
          await this.materialRepository.createQueryBuilder()
        .update(Material)
        .set({
            quantity: () => `quantity + ${detail.quantity}`,
            total: () => `total + ${detail.total}`
        })
        .where("code = :code AND warehouseId = :warehouseId", { code: detail.code, warehouseId: entry.warehouse.id })
        .execute();
        
          
          // Actualizar Precio
    if (detail.price ) {
      // Actualizar el precio solo si es mayor en la bodega actual
      await this.materialRepository.createQueryBuilder()
          .update(Material)
          .set({ price: detail.price })
          .where("code = :code AND warehouseId = :warehouseId", { code: detail.code, warehouseId: entry.warehouse.id })
          .execute();
            
          }
    if (detail.iva ) {
      // Actualizar el IVA en la bodega actual
      await this.materialRepository.createQueryBuilder()
          .update(Material)
          .set({ iva: detail.iva })
          .where("code = :code AND warehouseId = :warehouseId", { code: detail.code, warehouseId: entry.warehouse.id })
          .execute();
            
          }
    if (detail.total_iva ) {
      // Actualizar el precio solo si es mayor en la bodega actual
      await this.materialRepository.createQueryBuilder()
          .update(Material)
          .set({ total_iva: detail.total_iva })
          .where("code = :code AND warehouseId = :warehouseId", { code: detail.code, warehouseId: entry.warehouse.id })
          .execute();
            
          }
        }else{
          
          if (detail.observation.startsWith("MATERIAL")) {
            const newMaterial = this.materialRepository.create({
              ...detail,
              warehouse: entry.warehouse, // Asignar la bodega de la entrada
              user: entry.user,
            });
            await this.materialRepository.save(newMaterial);
          }
          
          
        }
  
       

      }
    } catch (error) {
      // Propagar la excepción
      throw new Error(error);
      
    }
  } 

  async generarPDF(id: string, user: User): Promise<Buffer> {
    const entriesData = await this.entriesRepository.findOneBy({id: id});
    
    if (!entriesData) {
      throw new NotFoundException('Entrada no encontrada');
    }

    const formattedDate = moment(entriesData.date).format('DD/MM/YYYY HH:mm');
  
    // Calcular el total de los detalles del traslado
    const totalMat = entriesData.details.reduce((acc, detail) => acc + (detail.total), 0);
    const totalMatIva = entriesData.details.reduce((acc, detail) => acc + (detail.total_iva), 0);
    const totalFormatted = currencyFormatter.format(totalMat, { code: 'COP' });
   
    const totalFormattedIva = currencyFormatter.format(totalMatIva, { code: 'COP' });
    const resIva = currencyFormatter.format(totalMatIva - totalMat, { code: 'COP' });
    
    
    entriesData.details.forEach((detail) => {
      detail.price = currencyFormatter.format(detail.price, { code: 'USD' }); // Cambia 'USD' según tu moneda
      detail.total = currencyFormatter.format(detail.total, { code: 'USD' }); // Cambia 'USD' según tu moneda
      detail.total_iva = currencyFormatter.format(detail.total, { code: 'USD' }); // Cambia 'USD' según tu moneda
    });

    const pdfDefinition = {
      pageSize: 'letter', //legal
    pageMargins: [40, 40, 40, 40],
      header: {
        image: logoBase64,
        fit: [80, 80],
        alignment: 'left',
        margin: [20, 20],
      },
      content: [
        { text: 'ENTRADA DE MATERIALES', fontSize: 14, alignment: 'center', margin: [-30, 15, 0, 35] },
        {
          columns: [
            // Datos a la izquierda
            [
              { text: 'Fecha entrada: ' + formattedDate, fontSize: 10 },
              { text: 'Número de entrada: ' + entriesData.entryNumber, fontSize: 10 },
              { text: 'Origen: ' + entriesData.origin, fontSize: 10 },
            
            ],
            [
              { text: 'Nit: ' + entriesData.origin, fontSize: 10 },
              { text: 'Provedor: ' + entriesData.providerName, fontSize: 10, margin: [0, 0, 0, 20] }
              
            ],
          ],
        },
        // ... Otros detalles según sea necesario
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto','auto','auto', 'auto'],
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
                { text: 'Iva', style: 'tableHeader' },
                { text: 'Total+Iva', style: 'tableHeader' },
              ],
              // Agrega filas con los detalles del traslado
              ...entriesData.details.map((detail) => [
                {text: detail.code, alignment: 'center', fontSize: 7},
                 {text: detail.name, alignment: 'center', fontSize: 7}, 
                {text: detail.unity, alignment: 'center', fontSize: 7},
                {text: detail.serial, alignment: 'center', fontSize: 7},
                {text: detail.brand, alignment: 'center', fontSize: 7},
                { text: detail.quantity, alignment: 'center',fontSize: 8 }, // Centrar la cantidad
                {text: detail.price, alignment: 'center', fontSize: 8},
                {text: detail.total, alignment: 'center', fontSize: 8},
                {text: detail.iva, alignment: 'center', fontSize: 8},
                {text: detail.total_iva, alignment: 'center', fontSize: 8}
              ]),
              ['', '','', '', '', '', '', '', { text: 'Total', style: 'tableHeader' }, {text: totalFormatted, style: 'tableHeader'}],
              ['', '','', '', '', '','', '',  { text: 'IVA', style: 'tableHeader' }, {text: resIva, style: 'tableHeader'}],
              ['', '','', '', '', '','', '',  { text: 'Total+IVA', style: 'tableHeader' }, {text: totalFormattedIva, style: 'tableHeader'}],
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
        { text: 'Observaciones: ' + entriesData.observation, fontSize: 8, margin: [60, 40] },
        {
          columns: [
            { text: 'Firma Jefe de Bodega:__________________________', alignment: 'left' ,fontSize: 8, margin: [40, 40] },
            { text: 'Firma Encargado de sede: _________________________', fontSize: 8, margin: [40, 40] },
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

  async findAll(paginationDto: PaginationDto, user: User) {
    // const { limit = 10, offset = 0 } = paginationDto;
  
    let entriesQuery = this.entriesRepository.createQueryBuilder('entry')
      .leftJoinAndSelect('entry.details', 'details')
      .leftJoinAndSelect('entry.user', 'user')
      .leftJoinAndSelect('entry.warehouse', 'warehouse');
  
    if (!user.rol.includes('admin')) {
      // Si no es administrador, aplicar restricciones por bodega
      entriesQuery = entriesQuery
        .andWhere('warehouse.id IN (:...warehouseIds)', { warehouseIds: user.warehouses.map(warehouse => warehouse.id) });
    }
    // Agrega la condición para excluir las entradas eliminados
      entriesQuery = entriesQuery.andWhere('entry.deletedAt IS NULL');
  
    const entries = await entriesQuery
      // .skip(offset)
      // .take(limit)
      .getMany();
  
    return entries
  }

  async findOne(term: string, user: User) {
    let entry: Entry;
  
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
  
  async update(id: string, updateEntryDto: UpdateEntryDto, updateDetailDto: UpdateDetailDto[], user: User) {

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
    await this.updateMaterialAndMeterDetails(existingEntry);
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
    entry.entryNumber = entry.entryNumber+"-Cancelada";
    // Actualizar los materiales y herramientas
    await this.updateMaterialAndMeterDetailsOnDelete(entry);

    

    await this.entriesRepository.save(entry);
    // const material = await this.findOne( id );
    //await this.materialsRepository.delete({ id });
    return {message:'Entrada eliminada.'}
  }else{
    throw new NotFoundException(`La entrada no fue encontrado.`);
  }
}


async updateMaterialAndMeterDetailsOnDelete(entry: Entry) {
  try {
      for (const detail of entry.details) {
          // Obtener el material o herramienta existente
          const existingMaterial = await this.materialRepository.createQueryBuilder('material')
              .where('material.code = :code', { code: detail.code })
              .getOne();
          const existingTool = await this.toolRepository.createQueryBuilder('tool')
              .where('tool.code = :code', { code: detail.code })
              .getOne();

          // Disminuir la cantidad y el total de los materiales y herramientas
          if (existingMaterial) {
              await this.materialRepository.createQueryBuilder()
                  .update(Material)
                  .set({
                      quantity: () => `quantity - ${detail.quantity}`,
                      total: () => `total - ${detail.total}`
                  })
                  .where("code = :code AND warehouseId = :warehouseId", { code: detail.code, warehouseId: entry.warehouse.id })
                  .execute();
          }

          if (existingTool) {
              await this.toolRepository.createQueryBuilder()
                  .update(Tool)
                  .set({
                      quantity: () => `quantity - ${detail.quantity}`,
                      total: () => `total - ${detail.total}`
                  })
                  .where("code = :code AND warehouseId = :warehouseId", { code: detail.code, warehouseId: entry.warehouse.id })
                  .execute();
          }
          continue;
      }
  } catch (error) {
      // Propagar la excepción
      throw new Error(error);
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
