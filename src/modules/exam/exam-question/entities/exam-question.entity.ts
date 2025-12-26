import { Lesson } from 'src/modules/exam/lesson/entities/lesson.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Question } from '../../question/entities/question.entity';
import { SubExam } from '../../sub-exam/entities/sub-exam.entity';

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

    @ManyToOne(() => Lesson, lesson => lesson.exams, { onDelete: 'CASCADE' })
    @JoinColumn()
    lesson: Lesson;

    @OneToMany(() => Question, question => question.exam)
    questions: Question[];

    @OneToMany(() => SubExam, subExam => subExam.exam)
    subExams: SubExam[];

    @Column({ type: 'int', default: 1 })
    quantity: number;

    @Column({ type: 'int' })
    duration: number;
}

