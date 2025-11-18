import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

@Entity('users')
@Index(['email'])
export class User {
    @PrimaryGeneratedColumn({ name: 'user_id' })
    userId: number;

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: true })
    fullName?: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    avatar?: string;

    @Column({ type: 'date', nullable: true })
    dob?: Date;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

    @Column({ name: 'last_login', type: 'timestamp', nullable: true })
    lastLogin?: Date;

    @Column({ name: 'login_type', type: 'varchar', length: 32, nullable: true })
    loginType?: string;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    @Column({ name: 'is_verified', type: 'boolean', default: false })
    isVerified: boolean;

    @Column({ name: 'access_token', type: 'varchar', length: 500, nullable: true })
    accessToken?: string;
}

