import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ParagraphService } from './paragraph.service';
import { CreateParagraphDto } from './dto/create-paragraph.dto';

@Controller('paragraph')
export class ParagraphController {
  constructor(private readonly paragraphService: ParagraphService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createParagraphDto: CreateParagraphDto) {
    return this.paragraphService.create(createParagraphDto);
  }

  @Get()
  findAll() {
    return this.paragraphService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paragraphService.findOne(id);
  }

  @Get('title-exam/:titleExamId')
  findByTitleExamId(@Param('titleExamId') titleExamId: string) {
    return this.paragraphService.findByTitleExamId(titleExamId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<CreateParagraphDto>,
  ) {
    return this.paragraphService.update(id, updateData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.paragraphService.remove(id);
  }
}
