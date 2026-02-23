/**
 * @file category.service.ts
 * @description Service for managing category business logic
 */
import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { ErrorStatusCodesEnum, Expose, SuccessStatusCodesEnum } from 'src/classes';

/**
 * Service for handling category-related operations
 */
@Injectable()
export class CategoryService {

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private readonly response: Expose
  ) { }


/**
   * Creates a new category in the database
   * @param createCategoryDto - Data transfer object containing category details
   * @param image - Image filename for the category
   * @param user - User object containing the user ID
   * @returns Success response with created category or error response
   */
  async create(createCategoryDto: CreateCategoryDto, image: string, user: any) {
    try {
      const category = this.categoryRepository.create({ ...createCategoryDto, image, user_id: user.userId })
      const result = await this.categoryRepository.save(category);
      return this.response.success(SuccessStatusCodesEnum.Ok, 'category created successfully', result)
    } catch (error) {
      return this.response.error(ErrorStatusCodesEnum.BadRequest, error.message || 'server error')
    }
  }

/**
   * Retrieves all categories from the database
   * @returns Success response with array of categories or error response
   */
  async findAll() {
    try {
      const result = await this.categoryRepository.find({ relations: { user_id: true } })
      return this.response.success(SuccessStatusCodesEnum.Ok, 'categories fetched successfully', result)
    } catch (error) {
      return this.response.error(ErrorStatusCodesEnum.BadRequest, error.message || 'server error')
    }
  }

/**
   * Retrieves a single category by ID
   * @param id - The ID of the category to retrieve
   * @returns Success response with category data or error response
   */
  async findOne(id: number) {
    try {
      const category = await this.categoryRepository.findOne({ where: { id }, relations: { user_id: true } });
      if (!category) return this.response.error(ErrorStatusCodesEnum.BadRequest, 'category not found')
      return this.response.success(SuccessStatusCodesEnum.Ok, 'category fetched successfully', category)
    } catch (error) {
      return this.response.error(ErrorStatusCodesEnum.BadRequest, error.message || 'server error')
    }
  }

/**
   * Updates an existing category
   * @param id - The ID of the category to update
   * @param updateCategoryDto - Data transfer object containing update details
   * @param user - User object containing the user ID
   * @param image - Optional image filename for the category
   * @returns Success response with updated category or error response
   */
  async update(id: number, updateCategoryDto: UpdateCategoryDto, user: any, image?: string,) {
    try {
      const categoty = await this.findOne(id)
      this.categoryRepository.merge(categoty.data, { ...updateCategoryDto, user_id: user.userId, image });
      const result = await this.categoryRepository.save(categoty.data)
      return this.response.success(SuccessStatusCodesEnum.Ok, 'category updated successfully', result)
    } catch (error) {
      return this.response.error(ErrorStatusCodesEnum.BadRequest, error.message || 'server error')
    }
  }

/**
   * Deletes a category from the database
   * @param id - The ID of the category to delete
   * @returns Success notification or error response
   */
  async remove(id: number) {
    try {
      const category = await this.findOne(id)
      await this.categoryRepository.remove(category.data);
      return this.response.notify(SuccessStatusCodesEnum.Ok, 'category deleted successfully')
    } catch (error) {
      return this.response.error(ErrorStatusCodesEnum.BadRequest, error.message || 'server error')
    }
  }
}
