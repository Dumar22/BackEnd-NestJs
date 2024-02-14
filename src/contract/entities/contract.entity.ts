import { BeforeInsert, BeforeUpdate, Column, 
    CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn,
     UpdateDateColumn } from "typeorm";
import * as moment from 'moment-timezone';
import { User } from "src/auth/entities/user.entity";
import { Warehouse } from "src/warehouses/entities/warehouse.entity";
import { ExitMaterial } from "src/exit-materials/entities/exit-material.entity";

@Entity()
export class Contract {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({nullable: false })
    contract: string;

    @Column({nullable: false })
    name: string;
  
    @Column({nullable: true })
    ot: string;
  
    @Column({nullable: false })
    addres: string;

    @Column({nullable: false })
    request: string;

    @Column({nullable: false })
    status: string;

    @Column({nullable: false })
    municipality: string;

    @Column({nullable: false })
    neighborhood: string;

    @Column({ nullable: false })
    phone: string;

    @Column({nullable: false })
    date: Date;

    @Column({nullable: true })
    dateFinalization: Date;

    // @Column({default:false, nullable: false })
    // available: boolean;
      
    @Column('text',{ nullable: true })
    observation: string;
          
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(
     () => User,
     (user) => user.contract,
     {eager: true})
    user: User

    @ManyToOne(() => Warehouse, warehouse => warehouse.contracts)
    warehouse: Warehouse;

    @OneToMany(() => ExitMaterial, 
    exitMateial => exitMateial.contract)
    exitMaterial: ExitMaterial[];


   @Column({ nullable: true })
   deletedBy: string;

   @Column({ nullable: true })
   deletedAt: Date;

   
    @BeforeInsert()
    insertTotal(){
        this.name = this.name.toUpperCase()       
        this.addres = this.addres.toUpperCase()       
        this.createdAt = moment().tz('America/Bogota').toDate();
        this.updatedAt =  new Date();        
    }
    @BeforeUpdate()
    updateTotal(){
        this.name = this.name.toUpperCase()
        this.addres = this.addres.toUpperCase()        
        this.updatedAt =  new Date();
       
    }

}