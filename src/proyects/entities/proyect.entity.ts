import { BeforeInsert, BeforeUpdate, Column, 
    CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn,
     UpdateDateColumn } from "typeorm";
import * as moment from 'moment-timezone';
import { User } from "src/auth/entities/user.entity";
import { Warehouse } from "src/warehouses/entities/warehouse.entity";
import { AssingMaterialsProyect } from "src/assing-materials-proyect/entities/assing-materials-proyect.entity";
import { Proyection } from "src/proyections/entities/proyection.entity";

@Entity()
export class Proyect {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({nullable: false })
    name: string;

    @Column({nullable: false })
    municipality: string;

    @Column({nullable: true })
    address: string;

    @Column({nullable: false })
    install: string;

    @Column({nullable: true})
    install2: string;

    @Column({nullable: false })
    type: string;

    @Column({nullable: true })
    house: number;

    @Column({nullable: true})
    apt: number;

    @Column({nullable: true})
    tower: string;

    @Column({nullable: true})
    floor: number   

    @Column({nullable: true})
    modifications: string    
    
    @Column({nullable: true })
    initialize: Date;

    @Column({nullable: true })
    obs: string;
                
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(
     () => User,
     (user) => user.provider,
     {eager: true})
    user: User

    @OneToMany(
        ()=> Proyection,
        (proyection) => proyection.proyect
      )
      proyection: Proyection

    @ManyToOne(() => Warehouse, warehouse => warehouse.providers)
    warehouse: Warehouse;

    @OneToMany(() => AssingMaterialsProyect, 
    assingMaterialsProyect => assingMaterialsProyect.proyect)
    assingMaterialsProyect: AssingMaterialsProyect[];


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
