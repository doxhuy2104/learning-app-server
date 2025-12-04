import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Subject } from '../../subject/entities/subject.entity';
import { User } from '../../user/entities/user.entity';

@Entity('groups')
export class Group {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 50 })
    name: string;

    @ManyToMany(() => Subject, (subject) => subject.groups)
    @JoinTable({
        name: 'group_subjects',
        joinColumn: { name: 'group_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'subject_id', referencedColumnName: 'id' },
    })
    subjects: Subject[];

    @OneToMany(() => User, (user) => user.group)
    users?: User[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

