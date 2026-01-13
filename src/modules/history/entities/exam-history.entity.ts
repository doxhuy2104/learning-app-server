import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exam } from '../../exam/exam-question/entities/exam-question.entity';
import { UserAnswer } from './user-answer.entity';

@Entity('exam_histories')
@Index(['userId', 'examId'])
export class ExamHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'int' })
  examId: number;

  @Column({ type: 'int', nullable: true })
  subjectId: number;

  @Column({ type: 'int', nullable: true })
  timeSpent?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score?: number;

  // @ManyToOne(() => User)
  // @JoinColumn({ name: 'user_id' })
  // user: User;

  @ManyToOne(() => Exam)
  @JoinColumn({ name: 'examId' })
  exam: Exam;

  @OneToMany(() => UserAnswer, (userAnswer) => userAnswer.examHistory)
  userAnswers: UserAnswer[];
}
