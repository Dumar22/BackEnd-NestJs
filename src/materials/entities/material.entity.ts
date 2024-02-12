import { BeforeInsert, BeforeUpdate, Column, 
    CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn,
     UpdateDateColumn } from "typeorm";
import * as moment from 'moment-timezone';
import { User } from "src/auth/entities/user.entity";
import { Warehouse } from "src/warehouses/entities/warehouse.entity";
import { AssignmentDetailsMaterialsVehicle } from "src/assignment-materials-vehicle/entities";
import { DetailsExitMaterials } from "src/exit-materials/entities/details-exit-materials";
import { AssingMaterialsDetailsProyect } from "src/assing-materials-proyect/entities/assing-materials-details-proyect.entity";
import { DetailsListMaterials } from "src/list-exit-materials/entities/details-list-material.entity";

@Entity()
export class Material {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({nullable: false })
    name: string;
  
    @Column({nullable: false })
    code: string;
  
    @Column({nullable: false })
    unity: string;

    @Column('int',{ default:0, nullable: false })
    quantity: number;

    @Column('float',{default:0, nullable: false })
    price: number;
  
    @Column({default:false, nullable: false })
    available: boolean;
  
    @Column('float',{default:0,nullable: false })
    total: number;

    @Column('text',{ nullable: true })
    observation: string;
          
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(
     () => User,
     (user) => user.material,
     {eager: true})
    user: User

    @ManyToOne(() => Warehouse, warehouse => warehouse.materials)
    warehouse: Warehouse;

    @OneToMany(() => AssignmentDetailsMaterialsVehicle,
    materialAssignment => materialAssignment.material)     
  materialAssignments: AssignmentDetailsMaterialsVehicle[];

    @OneToMany(() => DetailsListMaterials,
    materialList => materialList.material)     
  materialList: DetailsListMaterials[];

    @OneToMany(() => DetailsExitMaterials ,
    materialexit => materialexit.material,
   )     
  exitMaterials: DetailsExitMaterials [];

    @OneToMany(() => AssingMaterialsDetailsProyect ,
    assingMaterialsDetailsProyect => assingMaterialsDetailsProyect.material)     
  exitMaterialsProyect: AssingMaterialsDetailsProyect [];


   @Column({ nullable: true })
   deletedBy: string;

   @Column({ nullable: true })
   deletedAt: Date;

   
    @BeforeInsert()
    insertTotal(){
        this.name = this.name.toUpperCase()
        this.total = this.price* this.quantity;
        this.createdAt = moment().tz('America/Bogota').toDate();
        this.updatedAt =  new Date();
        this.available = this.quantity > 0 ? true : false;
    }
    @BeforeUpdate()
    updateTotal(){
        this.name = this.name.toUpperCase()
        this.total = this.price* this.quantity;
        this.updatedAt =  new Date();
        this.available = this.quantity > 0 ? true : false;
    }
}
