import * as moment from 'moment-timezone';
import { User } from "src/auth/entities/user.entity";
import { Collaborator } from "src/collaborators/entities/collaborator.entity";
import { Warehouse } from "src/warehouses/entities/warehouse.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { AssignmentDetailsMaterialsVehicle } from "./assignment-details-materials-vehicle.entity";
import { Vehicle } from "src/vehicles/entities/vehicle.entity";

@Entity()
export class AssignmentMaterialsVehicle {

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
   collaborator => collaborator.assignmentsMaterialsVehicle, 
   {eager:true})
   collaborator: Collaborator;


    @ManyToOne(() => Vehicle, 
   vehicle => vehicle.assignmentMaterialsVehicle, 
   {eager:true})
   vehicle: Vehicle;

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
    () => AssignmentDetailsMaterialsVehicle,
    details => details.assignmentDetailsMaterialsVehicle,
    {eager: true})
   details: AssignmentDetailsMaterialsVehicle[];

   
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
