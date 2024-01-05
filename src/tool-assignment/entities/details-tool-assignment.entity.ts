import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BeforeInsert } from 'typeorm';
import { ToolAssignment } from './tool-assignment.entity';
import { Tool } from 'src/tools/entities/tool.entity';

@Entity()
export class ToolAssignmentDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;  

  @ManyToOne(() => Tool,
   tool => tool.toolAssignments,
   )
  tool: Tool;

   @Column('int',{ default:0, nullable: false })
    assignedQuantity: number;

    @Column('float', { default: 0 }) // cuenta la duabilidad de la herramienta al mometo de cambiar se debe caviar su valor
    durabilityTool: number;

    @Column('text',{ nullable: true })
    observation: string;   

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  returnedAt: Date;  

  @Column({default:false, nullable: false })
  returnTools: boolean;

  @ManyToOne(() => ToolAssignment,
   toolAssignment => toolAssignment.details,
   )
  toolAssignment: ToolAssignment;


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
}