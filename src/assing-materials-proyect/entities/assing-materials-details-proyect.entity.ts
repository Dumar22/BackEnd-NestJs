import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { Material } from 'src/materials/entities/material.entity';
import { AssingMaterialsProyect } from './assing-materials-proyect.entity';

@Entity()
export class AssingMaterialsDetailsProyect {
  @PrimaryGeneratedColumn('uuid')
  id: string;  

  @ManyToOne(() => Material,
   material => material.exitMaterialsProyect,
   {eager: true})
  material: Material;
  
   @Column('int',{ default:0, nullable: false })
    assignedQuantity: number;   

    @Column('text',{ nullable: true })
    observation: string;   

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  returnedAt: Date;  

  @Column({default:false, nullable: false })
  returnMaterials: boolean;

  @ManyToOne(() => AssingMaterialsProyect,
  assingMaterialsProyect =>
  assingMaterialsProyect.details,
   )
   assingMaterialsProyect: AssingMaterialsProyect;

}