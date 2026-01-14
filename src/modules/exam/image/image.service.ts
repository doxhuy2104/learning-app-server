import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './entities/image.entity';
import { CreateImageDto } from './dto/create-image.dto';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
  ) {}

  async create(createImageDto: CreateImageDto): Promise<Image> {
    const image = this.imageRepository.create(createImageDto);
    return await this.imageRepository.save(image);
  }

  async findAll(): Promise<Image[]> {
    return await this.imageRepository.find({
      relations: ['exam'],
    });
  }

  async findOne(id: number): Promise<Image | null> {
    return await this.imageRepository.findOne({
      where: { id },
      relations: ['lessons'],
    });
  }


  async findByExamId(
    examId: number,
  ): Promise<Image[] | null> {
    return await this.imageRepository.find({
      where: { examId },
      relations: ['exam'],
    });
  }

  async update(
    id: number,
    updateData: Partial<CreateImageDto>,
  ): Promise<Image | null> {
    await this.imageRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.imageRepository.delete(id);
  }
}
