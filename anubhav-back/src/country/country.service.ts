/**
 * @file country.service.ts
 * @description Service for managing country business logic
 */
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { Country } from './entities/country.entity';
import { Repository } from 'typeorm';

/**
 * Service for handling country-related operations
 */
@Injectable()
export class CountryService {
  
  constructor(@InjectRepository(Country)
   private countryRepo:Repository<Country>){}
  
/**
   * Creates a new country in the database
   * @param createCountryDto - Data transfer object containing country details
   * @returns Created country data
   */
  async createCountry(createCountryDto: CreateCountryDto):Promise <Country> {
    const newCountry = this.countryRepo.create(createCountryDto) ;
    return this.countryRepo.save(newCountry);
  }


/**
   * Retrieves all countries from the database
   * @returns Array of all countries
   */
  async findAllCountry():Promise <Country[]>{
      return this.countryRepo.find();
  }

/**
   * Retrieves a single country by ID
   * @param id - The ID of the country to retrieve
   * @returns Country data or error message
   */
  async findOneCountry(id: number):Promise <Country | string> {
    const country = await this.countryRepo.findOne({where:{id}}) ; 
    if(!country){
      return `country with id: ${id} not found..!`
    } else{
      return country;
    }  
  }

/**
   * Updates an existing country
   * @param id - The ID of the country to update
   * @param updateCountryDto - Data transfer object containing update details
   * @returns Updated country data or error message
   */
  async updateCountry(id: number, updateCountryDto: UpdateCountryDto):Promise <Country | string> {
    const country = await this.countryRepo.findOne({where:{id}}) ; 
    if(!country){
      return `country with id: ${id} not found..!`
    } else{
      Object.assign(country , updateCountryDto) ; 
      return this.countryRepo.save(country) ; 
    }  
  }

/**
   * Deletes a country from the database
   * @param id - The ID of the country to delete
   * @returns void
   */
  async removeCountry(id: number):Promise <void>  {
       await this.countryRepo.delete(id); 
  }
}
