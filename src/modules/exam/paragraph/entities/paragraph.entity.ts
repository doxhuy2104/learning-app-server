import { Question } from 'src/modules/exam/question/entities/question.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exam } from '../../exam-question/entities/exam-question.entity';

@Entity('paragraphs')
export class Paragraph {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int' })
  examId: number;

  @Column({ type: 'varchar', length: 255 })
  titleExamId: string;

  @OneToMany(() => Question, (question) => question.paragraph)
  questions: Question[];

  @ManyToOne(() => Exam, (exam) => exam.paragraphs)
  exam: Exam;
}
