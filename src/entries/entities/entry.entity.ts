    import { BeforeInsert, BeforeUpdate, Column, 
        CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn,
         UpdateDateColumn } from "typeorm";
    import * as moment from 'moment-timezone';
    import { User } from "src/auth/entities/user.entity";
    import { Warehouse } from "src/warehouses/entities/warehouse.entity";
import { DetailsEntry } from "./details.entity";
    
    @Entity()
    export class Entry {
    
        @PrimaryGeneratedColumn('uuid')
        id: string;
    
        @Column({nullable: false })
        date: Date;
    
        @Column({nullable: false })
        entryNumber: string;
      
        @Column({nullable: false })
        origin: string;
      
        @Column({nullable: false })
        providerName: string;
    
        @Column({ nullable: false })
        providerNit: string;
              
        @Column('text',{ nullable: true })
        observation: string;
              
        @CreateDateColumn()
        createdAt: Date;
    
        @UpdateDateColumn()
        updatedAt: Date;       
    
        @ManyToOne(
         () => User,
         (user) => user.entry,
         {eager: true})
        user: User 
       
       @Column({ nullable: true })
       deletedBy: string;
    
       @Column({ nullable: true })
       deletedAt: Date;

       @ManyToOne(() => Warehouse, warehouse => warehouse.entries,
       {eager:true})
       warehouse: Warehouse;   
       
       @OneToMany(
        () => DetailsEntry,
        details => details.entry,
        {eager: true})
       details: DetailsEntry[];
    
       
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



