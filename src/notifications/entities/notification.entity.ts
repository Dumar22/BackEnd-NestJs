// notification.entity.ts
import { User } from 'src/auth/entities/user.entity';
import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';


@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  message: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @Column({ default: false })
  isRead: boolean;
}

