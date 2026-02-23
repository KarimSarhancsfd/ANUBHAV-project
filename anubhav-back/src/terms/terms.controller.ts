/**
 * @file Terms controller for handling terms and policies HTTP requests
 * @description REST API controller for managing terms and policies endpoints
 */
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TermsService } from './terms.service';
import { CreateTermDto } from './dto/create-term.dto';
import { UpdateTermDto } from './dto/update-term.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Terms & Policies')
@Controller('terms')
// @UseGuards(JwtAuthGuard)

/**
 * Controller for handling terms and policies related HTTP requests
 */
export class TermsController {
  constructor(private readonly termsService: TermsService) {}

  /**
   * Creates a new term entry
   * @param createTermDto - Data transfer object containing term details
   * @returns Created term object with id, term, policy, timestamps
   */
  @ApiOperation({ summary: 'Create a new term' })
  @ApiResponse({ status: 201, description: 'Term created successfully' })
  @Post('term')
  async createTerm(@Body() createTermDto: CreateTermDto) {
    const term = await this.termsService.create(createTermDto);
    return {
      id: term.id,
      term: term.term,
      policy: term.policy,
      createdAt: term.createdAt,
      updatedAt: term.updatedAt,
      deletedAt: term.deletedAt
    };
  }

  /**
   * Creates a new policy entry
   * @param createTermDto - Data transfer object containing policy details
   * @returns Created policy object with id, term, policy, timestamps
   */
  @ApiOperation({ summary: 'Create a new policy' })
  @ApiResponse({ status: 201, description: 'Policy created successfully' })
  @Post('policy')
  async createPolicy(@Body() createTermDto: CreateTermDto) {
    const policy = await this.termsService.create(createTermDto);
    return {
      id: policy.id,
      term: policy.term,
      policy: policy.policy,
      createdAt: policy.createdAt,
      updatedAt: policy.updatedAt,
      deletedAt: policy.deletedAt
    };
  }

  /**
   * Retrieves all terms
   * @returns Array of term objects with id, term, policy, timestamps
   */
  @ApiOperation({ summary: 'Get all terms' })
  @ApiResponse({ status: 200, description: 'List of all terms' })
  @Get('term')
  async getTerm() {
    const terms = await this.termsService.findAll();
    return terms.map(term => ({
      id: term.id,
      term: term.term,
      policy: term.policy,
      createdAt: term.createdAt,
      updatedAt: term.updatedAt,
      deletedAt: term.deletedAt
    }));
  }

  /**
   * Retrieves all policies
   * @returns Array of policy objects with id, term, policy, timestamps
   */
  @ApiOperation({ summary: 'Get all policies' })
  @ApiResponse({ status: 200, description: 'List of all policies' })
  @Get('policy')
  async getPolicy() {
    const policies = await this.termsService.findAll();
    return policies.map(policy => ({
      id: policy.id,
      term: policy.term,
      policy: policy.policy,
      createdAt: policy.createdAt,
      updatedAt: policy.updatedAt,
      deletedAt: policy.deletedAt
    }));
  }

  /**
   * Retrieves a single term/policy by ID
   * @param id - The ID of the term/policy to retrieve
   * @returns The term/policy object if found
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.termsService.findOne(+id);
  }

  /**
   * Updates an existing term/policy
   * @param id - The ID of the term/policy to update
   * @param updateTermDto - Data transfer object containing updated term/policy details
   * @returns Update result
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTermDto: UpdateTermDto) {
    return this.termsService.update(+id, updateTermDto);
  }

  /**
   * Soft deletes a term/policy by ID
   * @param id - The ID of the term/policy to delete
   * @returns Delete result
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.termsService.remove(+id);
  }
}
