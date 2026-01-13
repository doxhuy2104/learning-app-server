import { Exam } from 'src/modules/exam/exam-question/entities/exam-question.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Question } from '../../question/entities/question.entity';

@Entity('subexams')
export class SubExam {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  url: string;

  @Column({ type: 'int', default: 0 })
  totalQuestions: number;

  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  @Column({ type: 'int' })
  examId: number;

  @ManyToOne(() => Exam, (exam) => exam.subExams, { onDelete: 'CASCADE' })
  @JoinColumn()
  exam: Exam;

  @OneToMany(() => Question, (question) => question.subExam)
  questions: Question[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
