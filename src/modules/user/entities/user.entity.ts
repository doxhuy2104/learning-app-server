import { Group } from 'src/modules/group/entities/group.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('users')
@Index(['email'])
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    fullName?: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    avatar?: string;

    @Column({ type: 'date', nullable: true })
    dob?: Date;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastLogin?: Date;

    @Column({ type: 'varchar', length: 32, nullable: true })
    loginType?: string;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'boolean', default: false })
    isVerified: boolean;

    @Column({ type: 'varchar', length: 500, nullable: true })
    accessToken?: string;

    @Column({ type: 'varchar', length: 20, default: 'USER' })
    role: 'ADMIN' | 'USER';

    @Column({ type: 'int', nullable: true })
    groupId?: number;

    @ManyToOne(() => Group, { nullable: true })
    @JoinColumn()
    group?: Group;
}

