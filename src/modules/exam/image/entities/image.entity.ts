import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exam } from '../../exam-question/entities/exam-question.entity';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  url: string;

  @Column({ type: 'int', nullable: true })
  examId: number;

  @ManyToOne(() => Exam, (exam) => exam.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  exam: Exam;

}
