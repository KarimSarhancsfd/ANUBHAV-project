import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { ErrorStatusCodesEnum, Expose, SuccessStatusCodesEnum } from 'src/classes';

@Injectable()
export class CategoryService {

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private readonly response: Expose
  ) { }


  async create(createCategoryDto: CreateCategoryDto, image: string, user: any) {
    try {
      const category = this.categoryRepository.create({ ...createCategoryDto, image, user_id: user.userId })
      const result = await this.categoryRepository.save(category);
      return this.response.success(SuccessStatusCodesEnum.Ok, 'category created successfully', result)
    } catch (error) {
      return this.response.error(ErrorStatusCodesEnum.BadRequest, error.message || 'server error')
    }
  }

  async findAll() {
    try {
      const result = await this.categoryRepository.find({ relations: { user_id: true } })
      return this.response.success(SuccessStatusCodesEnum.Ok, 'categories fetched successfully', result)
    } catch (error) {
      return this.response.error(ErrorStatusCodesEnum.BadRequest, error.message || 'server error')
    }
  }

  async findOne(id: number) {
    try {
      const category = await this.categoryRepository.findOne({ where: { id }, relations: { user_id: true } });
      if (!category) return this.response.error(ErrorStatusCodesEnum.BadRequest, 'category not found')
      return this.response.success(SuccessStatusCodesEnum.Ok, 'category fetched successfully', category)
    } catch (error) {
      return this.response.error(ErrorStatusCodesEnum.BadRequest, error.message || 'server error')
    }
  }

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
