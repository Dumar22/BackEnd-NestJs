import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as moment from 'moment-timezone';
import { User } from 'src/auth/entities/user.entity';
import { Warehouse } from 'src/warehouses/entities/warehouse.entity';
import { DetailsTransfer } from './';

@Entity()
export class Transfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  date: Date;

  @Column({ nullable: false })
  transferNumber: string;

  @Column({ nullable: false })
  origin: string;

  @Column({ nullable: false })
  destination: string;

  @Column({ nullable: false })
  autorization: string;

  @Column({ nullable: false })
  receive: string;

  @Column({ nullable: false })
  documentreceive: string;

  @Column({ nullable: false })
  delivery: string;

  @Column({ nullable: false })
  documentdelivery: string;

  @Column('text', { nullable: true })
  observation: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.transfer, { eager: true })
  user: User;

  @Column({ nullable: true })
  deletedBy: string;

  @Column({ nullable: true })
  deletedAt: Date;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.transfers, {
    eager: true,
  })
  warehouse: Warehouse;

  @OneToMany(
    () => DetailsTransfer,
    (details) => details.transfer, {
    eager: true,
  } )
  details: DetailsTransfer[];

  @BeforeInsert()
  insertTotal() {
    moment.tz.setDefault('America/Bogota');

    this.createdAt = moment().toDate();

    this.updatedAt = moment().toDate();
  }
  @BeforeUpdate()
  updateTotal() {
    moment.tz.setDefault('America/Bogota');

    this.updatedAt = moment().toDate();
  }
}
