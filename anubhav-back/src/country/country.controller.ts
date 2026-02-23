/**
 * @file country.controller.ts
 * @description Controller for handling country-related HTTP requests
 */
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CountryService } from './country.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { Country } from './entities/country.entity';

/**
 * Controller for managing country endpoints
 */
@Controller('country')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

/**
 * Creates a new country
 * @param createCountryDto - Data transfer object for creating a country
 * @returns Created country data
 */
  @Post()
  create(@Body() createCountryDto: CreateCountryDto):Promise <Country> {
    return this.countryService.createCountry(createCountryDto);
  }

/**
 * Retrieves all countries
 * @returns Array of all countries
 */
  @Get()
  findAll():Promise <Country[]> {
    return this.countryService.findAllCountry();
  }

/**
 * Retrieves a single country by ID
 * @param id - The ID of the country to retrieve
 * @returns Country data or error message
 */
  @Get(':id')
  findOne(@Param('id') id: string):Promise <Country | string> {
    return this.countryService.findOneCountry(+id);
  }

/**
 * Updates an existing country
 * @param id - The ID of the country to update
 * @param updateCountryDto - Data transfer object for updating a country
 * @returns Updated country data or error message
 */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCountryDto: UpdateCountryDto):Promise <Country | string> {
    return this.countryService.updateCountry(+id, updateCountryDto);
  }

/**
 * Deletes a country
 * @param id - The ID of the country to delete
 * @returns void
 */
  @Delete(':id')
  remove(@Param('id') id: string):Promise <void>  {
    return this.countryService.removeCountry(+id);
  }
}
