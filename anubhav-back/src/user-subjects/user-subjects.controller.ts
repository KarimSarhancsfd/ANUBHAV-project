import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UserSubjectsService } from './user-subjects.service';
import { CreateUserSubjectDto } from './dto/create-user-subject.dto';
import { UpdateUserSubjectDto } from './dto/update-user-subject.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('user-subjects')
@UseGuards(JwtAuthGuard)
export class UserSubjectsController {
  constructor(private readonly userSubjectsService: UserSubjectsService) { }

  @Post()
  create(@Body() createUserSubjectDto: CreateUserSubjectDto) {
    return this.userSubjectsService.create(createUserSubjectDto);
  }

  @Get()
  findAll() {
    return this.userSubjectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userSubjectsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserSubjectDto: UpdateUserSubjectDto) {
    return this.userSubjectsService.update(id, updateUserSubjectDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userSubjectsService.remove(id);
  }
}
