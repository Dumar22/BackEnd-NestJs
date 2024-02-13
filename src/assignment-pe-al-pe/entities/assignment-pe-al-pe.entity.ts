import * as moment from 'moment-timezone';
import { User } from 'src/auth/entities/user.entity';
import { Collaborator } from 'src/collaborators/entities/collaborator.entity';
import { Warehouse } from 'src/warehouses/entities/warehouse.entity';
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { AssignmentDetails } from './details-assignment-pe-al-pe.entity';

@Entity()
export class AssignmentPeAlPe {


    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({nullable: false })
    date: Date;

    @Column({nullable: false })
  reason: string;

  @Column('text',{nullable: true })
  observation: string;
    
   @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;   
    
    @ManyToOne(() => Collaborator, 
   collaborator => collaborator.assignmentPeAlPe, 
   {eager:true})
   collaborator: Collaborator;

    @ManyToOne(
     () => User,
     (user) => user.assignmentPeAlPe,
     {eager: true})
    user: User 
   
   @Column({ nullable: true })
   deletedBy: string;

   @Column({ nullable: true })
   deletedAt: Date;

   @ManyToOne(() => Warehouse, 
   warehouse => warehouse.assignmentPeAlPe,
   {eager:true})
   warehouse: Warehouse;   
   
   @OneToMany(
    () => AssignmentDetails,
    details => details.assignmentDetails,
    {eager: true})
   details: AssignmentDetails[];

   
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

