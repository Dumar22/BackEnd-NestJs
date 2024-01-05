import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { AssignmentMaterialsVehicle } from './assignment-materials-vehicle.entity';
import { Material } from 'src/materials/entities/material.entity';

@Entity()
export class AssignmentDetailsMaterialsVehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;  

  @ManyToOne(() => Material,
   tool => tool.materialAssignments,
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

  @ManyToOne(() => AssignmentMaterialsVehicle,
  assignmentDetailsMaterialsVehicle =>
   assignmentDetailsMaterialsVehicle.details,
   )
   assignmentDetailsMaterialsVehicle: AssignmentDetailsMaterialsVehicle;

}