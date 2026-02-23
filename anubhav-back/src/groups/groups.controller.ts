/**
 * @file groups.controller.ts
 * @description Controller for handling group-related HTTP requests
 */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupsDto } from './dto/create-group.dto';
import { UpdateGroupsDto } from './dto/update-group.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('groups')
@UseGuards(JwtAuthGuard)
/**
 * Controller for managing groups CRUD operations
 */
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  /**
   * Creates a new group
   * @param createGroupDto - The data transfer object containing group creation details
   * @returns The created group
   */
  @Post()
  create(@Body() createGroupDto: CreateGroupsDto) {
    return this.groupsService.create(createGroupDto);
  }

  /**
   * Retrieves all groups
   * @returns An array of all groups
   */
  @Get()
  findAll() {
    return this.groupsService.findAll();
  }

  /**
   * Retrieves a single group by ID
   * @param id - The ID of the group to retrieve
   * @returns The group with the specified ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(+id);
  }

  /**
   * Updates an existing group
   * @param id - The ID of the group to update
   * @param updateGroupDto - The data transfer object containing group update details
   * @returns The updated group
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupsDto) {
    return this.groupsService.update(+id, updateGroupDto);
  }

  /**
   * Deletes a group by ID
   * @param id - The ID of the group to delete
   * @returns void
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupsService.remove(+id);
  }
}
