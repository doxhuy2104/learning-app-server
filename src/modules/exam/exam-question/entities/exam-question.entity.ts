import { Lesson } from 'src/modules/exam/lesson/entities/lesson.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from '../../question/entities/question.entity';
import { SubExam } from '../../sub-exam/entities/sub-exam.entity';
import { Subject } from '../../subject/entities/subject.entity';
import { Image } from '../../image/entities/image.entity';
import { Paragraph } from '../../paragraph/entities/paragraph.entity';

@Entity('exams')
export class Exam {
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

  @Column({ type: 'int', nullable: true })
  lessonId: number;

  @Column({ type: 'int', nullable: true })
  courseId: number;

  @ManyToOne(() => Lesson, (lesson) => lesson.exams, { onDelete: 'CASCADE' })
  @JoinColumn()
  lesson: Lesson;

  @OneToMany(() => Question, (question) => question.exam)
  questions: Question[];

  @OneToMany(() => SubExam, (subExam) => subExam.exam)
  subExams: SubExam[];

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'int' })
  duration: number;

  @Column({ type: 'int', default: 2 })
  subjectId: number;

  @ManyToOne(() => Subject, (subject) => subject.exams, { onDelete: 'CASCADE' })
  @JoinColumn()
  subject: Subject;

  @OneToMany(() => Paragraph, (paragraph) => paragraph.exam)
  paragraphs: Paragraph[];

  @OneToMany(() => Image, (image) => image.exam)
  images: Image[];
}
