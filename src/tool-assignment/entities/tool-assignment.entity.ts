import * as moment from 'moment-timezone';
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, BeforeInsert, UpdateDateColumn, CreateDateColumn, OneToMany, BeforeUpdate, ManyToMany } from "typeorm";
import { Collaborator } from "src/collaborators/entities/collaborator.entity";
import { User } from "src/auth/entities/user.entity";
import { Warehouse } from "src/warehouses/entities/warehouse.entity";
import { ToolAssignmentDetails } from './tool-assignment-detail';


@Entity()
export class ToolAssignment {

  @PrimaryGeneratedColumn('uuid')
  id: string; 

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date;

  @Column({nullable: false })
  reason: string; //type of asssignment  
              
  
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
  {
    eager: true,
  }
  )
  collaborator: Collaborator;

  @OneToMany(
    () => ToolAssignmentDetails,
    (details) => details.assignmentDetails,
    {eager: true})
   details: ToolAssignmentDetails[];


  @ManyToOne(() => Warehouse, warehouse => warehouse.toolAssignments,
       {eager:true})
       warehouse: Warehouse;

  @ManyToOne(() => User,
  user => user.toolAssignment,)
  user: User  
             
    @BeforeInsert()
    insertTotal(){     
       this.createdAt = moment().tz('America/Bogota').toDate();
       this.updatedAt =  new Date();        
   }

   
  
  }
   

   
 


