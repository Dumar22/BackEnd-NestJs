import { DetailsEntriesTools } from "./entries-tool-details.entity";
import { User } from "src/auth/entities/user.entity";
import { Warehouse } from "src/warehouses/entities/warehouse.entity";
import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, BeforeInsert, BeforeUpdate, Entity } from "typeorm";
import moment from "moment";
@Entity()
export class EntriesTool {


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
         (user) => user.entryTool,
         {eager: true})
        user: User 
       
       @Column({ nullable: true })
       deletedBy: string;
    
       @Column({ nullable: true })
       deletedAt: Date;

       @ManyToOne(() => Warehouse, warehouse => warehouse.entriesTool,
       {eager:true})
       warehouse: Warehouse;   
       
       @OneToMany(
        () => DetailsEntriesTools,
        details => details.entryTool,
        {eager: true})
       details: DetailsEntriesTools[];
    
       
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
