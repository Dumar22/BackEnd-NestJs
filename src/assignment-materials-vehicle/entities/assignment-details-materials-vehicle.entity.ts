import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BeforeInsert, BeforeUpdate } from 'typeorm';
import { AssignmentMaterialsVehicle } from './assignment-materials-vehicle.entity';
import { Material } from 'src/materials/entities/material.entity';

@Entity()
export class AssignmentDetailsMaterialsVehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;  

  @ManyToOne(() => Material,
   material => material.materialAssignments,
   {eager: true})
  material: Material;
  
   @Column('int',{ default:0, nullable: false })
    assignedQuantity: number;     

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  returnedAt: Date;  

  @Column({default:false, nullable: false })
  returnMaterials: boolean;

  @Column('float', { default: 0, nullable: false })
  total: number;

  @ManyToOne(() => AssignmentMaterialsVehicle,
  assignmentDetailsMaterialsVehicle =>
   assignmentDetailsMaterialsVehicle.details,
   )
   assignmentDetailsMaterialsVehicle: AssignmentDetailsMaterialsVehicle;

   @BeforeInsert()
    insertTotal(){     
      this.total = this.assignedQuantity * this.material.price
   }


   @BeforeUpdate()
   insert(){     
    this.total = this.assignedQuantity * this.material.price
 }
}