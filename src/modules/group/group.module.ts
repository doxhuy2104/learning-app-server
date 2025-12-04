import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { Group } from './entities/group.entity';
import { Subject } from '../subject/entities/subject.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Group, Subject])],
    controllers: [GroupController],
    providers: [GroupService],
    exports: [GroupService],
})
export class GroupModule { }

