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

  @Column('int', { default: 0, nullable: false })
  total: number;

  @Column('text', { nullable: true })
  observation: string;

  @ManyToOne(() => Material, (material) => material.exitMaterials)
  material: Material;

  @OneToOne(() => Meter, {
    eager: true,
  })
  @JoinColumn()
  meter: Meter;

  @ManyToOne(() => ExitMaterial, (exitMaterial) => exitMaterial.details, {
    eager: true,
  })
  exitMaterial: ExitMaterial;

  @BeforeInsert()
  insertTotal(){
      this.used = this.assignedQuantity - this.restore
      // Verificar si this.material es null y asignar un precio predeterminado
    const materialPrice = this.material ? this.material.price : 0;
      this.total = this.used * materialPrice
      
  }
  @BeforeUpdate()
  updateTotal(){
    this.used = this.assignedQuantity - this.restore
    const materialPrice = this.material ? this.material.price : 0;
    this.total = this.used * materialPrice
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
