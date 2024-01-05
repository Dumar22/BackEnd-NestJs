import * as moment from 'moment-timezone';
import { User } from "src/auth/entities/user.entity";
import { Proyect } from "src/proyects/entities/proyect.entity";
import { Warehouse } from "src/warehouses/entities/warehouse.entity";
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { AssingMaterialsDetailsProyect } from "./assing-materials-details-proyect.entity";





@Entity()
export class AssingMaterialsProyect {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({nullable: false })
    date: Date;   

  @Column('text',{nullable: true })
  observation: string;
    
   @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;   
    
    
    @ManyToOne(() => Proyect, 
   proyect => proyect.assingMaterialsProyect, 
   {eager:true})
   proyect: Proyect;

    @ManyToOne(
     () => User,
     (user) => user.assignmentMaterialsVehicle,
     {eager: true})
    user: User 
   
   @Column({ nullable: true })
   deletedBy: string;

   @Column({ nullable: true })
   deletedAt: Date;

   @ManyToOne(() => Warehouse, 
   warehouse => warehouse.assignmentMaterialsVehicle,
   {eager:true})
   warehouse: Warehouse;   
   
   @OneToMany(
    () => AssingMaterialsDetailsProyect,
    details => details.assingMaterialsProyect,
    {eager: true})
   details: AssingMaterialsDetailsProyect[];

   
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
