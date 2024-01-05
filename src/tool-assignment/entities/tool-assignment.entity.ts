import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, BeforeInsert, UpdateDateColumn, CreateDateColumn, OneToMany, BeforeUpdate } from "typeorm";
import { Collaborator } from "src/collaborators/entities/collaborator.entity";
import * as moment from 'moment-timezone';
import { User } from "src/auth/entities/user.entity";
import { Warehouse } from "src/warehouses/entities/warehouse.entity";
import { ToolAssignmentDetail } from "./details-tool-assignment.entity";

@Entity()
export class ToolAssignment {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;  

  @Column({nullable: false })
  reason: string;

  @Column('text',{nullable: true })
  observation: string;
              
  @CreateDateColumn()
  createdAt: Date;
    
  @UpdateDateColumn()
  updatedAt: Date;       
     
       
  @Column({ nullable: true })
  deletedBy: string;
    
  @Column({ nullable: true })
  deletedAt: Date;

  @ManyToOne(() => Collaborator, 
  collaborator => collaborator.toolAssignments, 
  )
  collaborator: Collaborator;

  @ManyToOne(
    () => User,
    (user) => user.toolAssignment,
    )
    user: User 

  @ManyToOne(() => Warehouse, warehouse => warehouse.toolAssignments,
   )
   warehouse: Warehouse;   
       
   @OneToMany(
    () => ToolAssignmentDetail,
     details => details.toolAssignment,
    )
    details: ToolAssignmentDetail[];
    
       
    @BeforeInsert()
    insertTotal(){
                 
            this.createdAt = moment().tz('America/Bogota').toDate();
            this.updatedAt =  new Date();        
        }

   @BeforeUpdate()
    updateTotal(){              
     this.updatedAt =  new Date();
           
      }

 

}
