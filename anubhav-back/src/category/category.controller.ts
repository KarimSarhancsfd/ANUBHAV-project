/**
 * @file category.controller.ts
 * @description Controller for handling category-related HTTP requests
 */
import { ParseIntPipe, Req, UploadedFile } from '@nestjs/common';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';


/**
 * Controller for managing category endpoints
 */
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

/**
 * Creates a new category
 * @param createCategoryDto - Data transfer object for creating a category
 * @param image - Uploaded image file for the category
 * @param req - Express request object containing user information
 * @returns Created category data
 */
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() image: Express.Multer.File,
    @Req() req: Request) {
    return this.categoryService.create(createCategoryDto, image.filename, req['user']);
  }

/**
 * Retrieves all categories
 * @returns Array of all categories
 */
  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

/**
 * Retrieves a single category by ID
 * @param id - The ID of the category to retrieve
 * @returns Category data for the specified ID
 */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

/**
 * Updates an existing category
 * @param id - The ID of the category to update
 * @param updateCategoryDto - Data transfer object for updating a category
 * @param req - Express request object containing user information
 * @param image - Optional uploaded image file for the category
 * @returns Updated category data
 */
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Req() req: Request,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    console.log(updateCategoryDto, image?.filename);
    return this.categoryService.update(id, updateCategoryDto, req['user'], image?.filename);
  }

/**
 * Deletes a category
 * @param id - The ID of the category to delete
 * @returns Deletion confirmation
 */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.remove(id);
  }
}
