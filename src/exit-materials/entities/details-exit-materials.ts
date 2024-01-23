import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

import { Material } from 'src/materials/entities/material.entity';
import { ExitMaterial } from './exit-material.entity';
import { Meter } from 'src/meters/entities/meter.entity';

@Entity()
export class DetailsExitMaterials {
  @PrimaryGeneratedColumn('uuid')
  id: string; 

  @Column('int', { default: 0, nullable: false })
  assignedQuantity: number;

  @Column('int', { default: 0, nullable: false })
  restore: number;

  @Column('int', { default: 0, nullable: false })
  used: number;

  @Column('float', { default: 0, nullable: false })
  total: number;

  @Column('text', { nullable: true })
  observation: string;

  @ManyToOne(
    () => Material, 
    material => material.exitMaterials,
    {
      eager: true,
    }
    )
  material: Material;

  @OneToOne(() => Meter, {
    eager: true,
  })
  @JoinColumn()
  meter: Meter;

  @ManyToOne(
    () => ExitMaterial,
     exitMaterial => exitMaterial.details
     )
  exitMaterial: ExitMaterial;

  @BeforeInsert()
  insertTotal(){
   // Asegurarse de que los valores sean números válidos
   const isNumeric = (value: any) => !isNaN(parseFloat(value)) && isFinite(value);
// lo restamos con 0 por que en el momento de ingresar restore esta undifined
   this.used =  this.assignedQuantity - this.restore;

   // Verificar si this.material tiene un precio y asignar un precio predeterminado
   const materialPrice = this.material && isNumeric(this.material.price) ? this.material.price : 0;

   // Verificar si this.meter tiene un precio y asignar un precio predeterminado
   const meterPrice = this.meter && isNumeric(this.meter.price) ? this.meter.price : 0;

   // Seleccionar el precio mayor entre materialPrice y meterPrice
   const selectedPrice = Math.max(materialPrice, meterPrice);
   
   this.total = this.used * selectedPrice;
  }
  @BeforeUpdate()
  updateTotal(){

    const isNumeric = (value: any) => !isNaN(parseFloat(value)) && isFinite(value);
    
    this.used =  this.assignedQuantity - this.restore;

    // Verificar si this.material tiene un precio y asignar un precio predeterminado
    const materialPrice = this.material && isNumeric(this.material.price) ? this.material.price : 0;
 
    // Verificar si this.meter tiene un precio y asignar un precio predeterminado
    const meterPrice = this.meter && isNumeric(this.meter.price) ? this.meter.price : 0;
 
    // Seleccionar el precio mayor entre materialPrice y meterPrice
    const selectedPrice = Math.max(materialPrice, meterPrice);
    
    this.total = this.used * selectedPrice;
  }

}

// @Column({ nullable: false })
// name: string;

// @Column({ nullable: false })
// code: string;

// @Column({ nullable: false })
// unity: string;

// @Column({ nullable: true })
// serial: string;

// @Column({ nullable: true })
// brand: string;

// @Column('float', { default: 0, nullable: false })
// price: number;

// @Column('float', { default: 0, nullable: false })
// total: number;
