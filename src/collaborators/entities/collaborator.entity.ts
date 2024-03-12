import { BeforeInsert, BeforeUpdate, Column, 
    CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn,
     UpdateDateColumn } from "typeorm";
import * as moment from 'moment-timezone';
import { User } from "src/auth/entities/user.entity";
import { Warehouse } from "src/warehouses/entities/warehouse.entity";
import { ToolAssignment } from "src/tool-assignment/entities/tool-assignment.entity";
import { AssignmentMaterialsVehicle } from "src/assignment-materials-vehicle/entities";
import { ExitMaterial } from "src/exit-materials/entities/exit-material.entity";
import { AssignmentPeAlPe } from "src/assignment-pe-al-pe/entities/assignment-pe-al-pe.entity";


@Entity()
export class Collaborator {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({nullable: false })
    name: string;
  
    @Column({nullable: false })
    code: string;
  
    @Column({nullable: false })
    operation: string;

    @Column({ nullable: false })
    document: string;

    @Column({ nullable: false })
    phone: string;
        
    @Column({default:0,nullable: false })
    mail: string; 
    
    @Column({default:true, nullable: false })
    status: boolean;
          
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(
     () => User,
     (user) => user.collaborator,
     {eager: true})
    user: User

    @ManyToOne(() => Warehouse,
     warehouse => warehouse.collaborators)
    warehouse: Warehouse;

    @OneToMany(() => ToolAssignment, toolAssignment => toolAssignment.collaborator)
    toolAssignments: ToolAssignment[];

    @OneToMany(() => AssignmentMaterialsVehicle, 
    assignmentMaterialsVehicle => assignmentMaterialsVehicle.collaborator)
    assignmentsMaterialsVehicle: AssignmentMaterialsVehicle[];

    @OneToMany(() =>  AssignmentPeAlPe, 
    assignmentPeAlPe => assignmentPeAlPe.collaborator)
    assignmentPeAlPe:  AssignmentPeAlPe[];

    @OneToMany(() => ExitMaterial, 
    exitMateial => exitMateial.collaborator)
    exitMaterial: ExitMaterial[];


   @Column({ nullable: true })
   deletedBy: string;

   @Column({ nullable: true })
   deletedAt: Date;

   
    @BeforeInsert()
    insertTotal(){
        this.name = this.name.toUpperCase()        
        this.createdAt = moment().tz('America/Bogota').toDate();
        this.updatedAt =  new Date();
    }
    @BeforeUpdate()
    updateTotal(){
        this.name = this.name.toUpperCase()        
        this.updatedAt =  new Date();
    }
}