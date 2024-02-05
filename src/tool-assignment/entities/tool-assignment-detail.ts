import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, BeforeInsert, UpdateDateColumn, CreateDateColumn, OneToMany, BeforeUpdate, ManyToMany } from "typeorm";
import { Tool } from "src/tools/entities/tool.entity";
import { ToolAssignment } from "./tool-assignment.entity";

@Entity()
export class ToolAssignmentDetails {

  @PrimaryGeneratedColumn('uuid')
  id: string; 

  @ManyToOne(() => Tool,
   tool => tool.toolAssignments, 
   {eager: true} )
   tool: Tool;

  @Column('int',{ default:0, nullable: false })
   assignedQuantity: number;

   @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date;

   @Column('float', { default: 0 }) // cuenta la duabilidad de la herramienta al mometo de cambiar se debe caviar su valor
   durabilityTool: number;  

  @Column({default:false, nullable: false })
 returnTools: boolean;

 @Column('float', { default: 0, nullable: false })
  total: number;

 @Column({ type: 'timestamp', nullable: true })
 returnedAt: Date; 

 @ManyToOne(
  () => ToolAssignment,
  assignmentDetails =>
   assignmentDetails.details,
   )
   assignmentDetails: ToolAssignment;


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

    const isNumeric = (value: any) => !isNaN(parseFloat(value)) && isFinite(value);

    // Verificar si this.material tiene un precio y asignar un precio predeterminado
   const materialPrice = this.tool && isNumeric(this.tool.price) ? this.tool.price : 0;
   const selectedPrice = Math.max(materialPrice, );
   this.total = this.assignedQuantity * selectedPrice

  }
   

   @BeforeUpdate()
    updateTotal(){              
        const currentDate = new Date();
        const assignedAt = this.assignedAt instanceof Date ? this.assignedAt : currentDate;
        const returnedAt = this.returnedAt instanceof Date ? this.returnedAt : currentDate;
      
        // Calcular la diferencia en milisegundos y convertirla a días
        const durationInMilliseconds = returnedAt.getTime() - assignedAt.getTime();
        const durationInDays = durationInMilliseconds / (1000 * 60 * 60 * 24);
      
        // Redondear la duración y asignarla a la propiedad durabilityTool
        this.durabilityTool = Math.round(durationInDays);  
      }

 

}
