import { Course } from 'src/modules/course/entities/course.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany } from 'typeorm';
import { Group } from '../../group/entities/group.entity';

@Entity('subjects')
export class Subject {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 500 })
    title: string;

    @Column({ type: 'varchar', length: 1000, nullable: true })
    url: string;

    @Column({ type: 'varchar', length: 1000, nullable: true })
    image: string;

    @ManyToMany(() => Group, (group) => group.subjects)
    groups: Group[];
}

