import { Subject } from 'src/modules/exam/subject/entities/subject.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Lesson } from '../../lesson/entities/lesson.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  url: string;

  @OneToMany(() => Lesson, (lesson) => lesson.course)
  lessons: Lesson[];

  @Column({ type: 'int', nullable: true })
  subjectId: number;

  @ManyToOne(() => Subject, (subject) => subject.courses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  subject: Subject;

  @Column({ type: 'boolean', default: false })
  isExam: boolean;
}
