import { Question } from 'src/modules/exam/question/entities/question.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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


    @OneToMany(() => Question, question => question.paragraph)
    questions: Question[];
}

