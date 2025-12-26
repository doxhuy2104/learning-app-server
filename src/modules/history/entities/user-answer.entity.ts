import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Exam } from '../../exam/exam-question/entities/exam-question.entity';
import { ExamHistory } from './exam-history.entity';

@Entity('user_answers')
@Index(['historyId'])
export class UserAnswer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: true })
    historyId: number;

    @Column({ type: 'int' })
    examId: number;

    @Column({ type: 'int' })
    questionOrderIndex: number;

    @Column({ type: 'int', nullable: true })
    answerOrderIndex?: number;

    @Column({ type: 'text', nullable: true })
    shortAnswer?: string;

    @Column({ type: 'text', nullable: true })
    trueFalseAnswer?: string;

    @Column({ type: 'boolean', nullable: true })
    isCorrect?: boolean;

    @Column({
        type: 'numeric',
        precision: 5,
        scale: 2,
        default: 0
    })
    score: number;

    @ManyToOne(() => ExamHistory, (examHistory) => examHistory.userAnswers, {
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    examHistory: ExamHistory;

    @ManyToOne(() => Exam)
    @JoinColumn()
    exam: Exam;
}

