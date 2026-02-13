import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserActivitiesService } from './useractivities.service';
import { CreateUserActivitiesDto } from './dto/create-useractivities.dto';
import { UpdateUserActivitiesDto } from './dto/update-useractivities.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('useractivities')
@UseGuards(JwtAuthGuard)
export class UserActivitiesController {
  constructor(private readonly userActivitiesService: UserActivitiesService) {}

  @Post()
  create(@Body() createUserActivitiesDto: CreateUserActivitiesDto) {
    return this.userActivitiesService.create(createUserActivitiesDto);
  }

  @Get()
  findAll() {
    return this.userActivitiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userActivitiesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserActivitiesDto: UpdateUserActivitiesDto,
  ) {
    return this.userActivitiesService.update(+id, updateUserActivitiesDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userActivitiesService.remove(+id);
  }
}
