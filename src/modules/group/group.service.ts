import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Group } from './entities/group.entity';
import { Subject } from '../subject/entities/subject.entity';

@Injectable()
export class GroupService {
    constructor(
        @InjectRepository(Group)
        private groupRepository: Repository<Group>,
        @InjectRepository(Subject)
        private subjectRepository: Repository<Subject>,
    ) { }

    async findAll(): Promise<Group[]> {
        return await this.groupRepository.find({
            relations: ['subjects'],
        });
    }

    async findOne(id: number): Promise<Group | null> {
        return await this.groupRepository.findOne({
            where: { id },
            relations: ['subjects'],
        });
    }
}

