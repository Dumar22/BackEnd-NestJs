import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, OneToMany, OneToOne, JoinColumn } from 'typeorm';

import { Material } from 'src/materials/entities/material.entity';
import { ExitMaterial } from './exit-material.entity';
import { Meter } from 'src/meters/entities/meter.entity';

@Entity()
export class DetailsExitMaterials {
  @PrimaryGeneratedColumn('uuid')
  id: string;    
  
   @Column('int',{ default:0, nullable: false })
    assignedQuantity: number; 

   @Column('int',{ default:0, nullable: false })
    restore: number;   

    @Column('text',{ nullable: true })
    observation: string;   

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  returnedAt: Date;  

  @Column({default:false, nullable: false })
  returnMaterials: boolean;

  @ManyToOne(() => Material,
   material => material.exitMaterials,
   {eager: true})
  material: Material;

  @OneToOne(() => Meter, {
    eager: true,
  })
  @JoinColumn()
  meter: Meter;

  @ManyToOne(() => ExitMaterial,
  detailsExitMaterials =>
   detailsExitMaterials.details,
   )
   detailsExitMaterials: ExitMaterial;

}