import { Course } from 'src/modules/exam/course/entities/course.entity';
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Group } from '../../../group/entities/group.entity';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  url: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  image: string;

  @ManyToMany(() => Group, (group) => group.subjects)
  groups: Group[];

  @OneToMany(() => Course, (course) => course.subject)
  courses: Course[];

  @Column({ type: 'int' })
  duration: number;
}
