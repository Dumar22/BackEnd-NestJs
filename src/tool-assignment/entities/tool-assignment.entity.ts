import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, BeforeInsert, UpdateDateColumn, CreateDateColumn, OneToMany, BeforeUpdate, ManyToMany } from "typeorm";
import { Collaborator } from "src/collaborators/entities/collaborator.entity";
import * as moment from 'moment-timezone';
import { User } from "src/auth/entities/user.entity";
import { Warehouse } from "src/warehouses/entities/warehouse.entity";
import { Tool } from "src/tools/entities/tool.entity";

@Entity()
export class ToolAssignment {

  @PrimaryGeneratedColumn('uuid')
  id: string; 

  @Column({nullable: false })
  reason: string; //type of asssignment  
              
  @CreateDateColumn()
  createdAt: Date;
    
  @UpdateDateColumn()
  updatedAt: Date;           
       
  @Column({ nullable: true })
  deletedBy: string;
    
  @Column({ nullable: true })
  deletedAt: Date;

 @Column('text',{nullable: true })
 observation: string;

  @Column('int',{ default:0, nullable: false })
   assignedQuantity: number;

   @Column('float', { default: 0 }) // cuenta la duabilidad de la herramienta al mometo de cambiar se debe caviar su valor
   durabilityTool: number;     

 @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
 assignedAt: Date;

  @Column({default:false, nullable: false })
 returnTools: boolean;

 @Column({ type: 'timestamp', nullable: true })
 returnedAt: Date; 

 @ManyToOne(() => Collaborator, 
  collaborator => collaborator.toolAssignments, 
  )
  collaborator: Collaborator;

  @ManyToOne(() => Tool,
  tool => tool.toolAssignments, )
  tool: Tool;

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

   @BeforeInsert()
   calculateDurability(): void {
    // Calcular la duración en días (asumiendo que la asignación no ha sido devuelta)
    const currentDate = new Date();
    const assignedAt = this.assignedAt instanceof Date ? this.assignedAt : currentDate;
    const returnedAt = this.returnedAt instanceof Date ? this.returnedAt : currentDate;
  
    // Calcular la diferencia en milisegundos y convertirla a días
    const durationInMilliseconds = returnedAt.getTime() - assignedAt.getTime();
    const durationInDays = durationInMilliseconds / (1000 * 60 * 60 * 24);
  
    // Redondear la duración y asignarla a la propiedad durabilityTool
    this.durabilityTool = Math.round(durationInDays);
  }
   

   @BeforeUpdate()
    updateTotal(){              
     this.updatedAt =  new Date();    
      }

 

}
