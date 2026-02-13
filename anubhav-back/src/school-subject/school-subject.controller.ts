import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { SchoolSubjectService } from './school-subject.service';
import { CreateSchoolSubjectDto } from './dto/create-school-subject.dto';
import { UpdateSchoolSubjectDto } from './dto/update-school-subject.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('school-subject')
@UseGuards(JwtAuthGuard)
export class SchoolSubjectController {
  constructor(private readonly schoolSubjectService: SchoolSubjectService) { }

  @Post()
  create(@Body() createSchoolSubjectDto: CreateSchoolSubjectDto) {
    return this.schoolSubjectService.create(createSchoolSubjectDto);
  }

  @Get()
  findAll() {
    return this.schoolSubjectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.schoolSubjectService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSchoolSubjectDto: UpdateSchoolSubjectDto) {
    return this.schoolSubjectService.update(id, updateSchoolSubjectDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.schoolSubjectService.remove(id);
  }
}
