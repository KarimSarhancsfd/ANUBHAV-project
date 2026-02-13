import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { Country } from './entities/country.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CountryService {
  
  constructor(@InjectRepository(Country)
   private countryRepo:Repository<Country>){}
  
  async createCountry(createCountryDto: CreateCountryDto):Promise <Country> {
    const newCountry = this.countryRepo.create(createCountryDto) ;
    return this.countryRepo.save(newCountry);
  }


  async findAllCountry():Promise <Country[]>{
      return this.countryRepo.find();
  }

  async findOneCountry(id: number):Promise <Country | string> {
    const country = await this.countryRepo.findOne({where:{id}}) ; 
    if(!country){
      return `country with id: ${id} not found..!`
    } else{
      return country;
    }  
  }

  async updateCountry(id: number, updateCountryDto: UpdateCountryDto):Promise <Country | string> {
    const country = await this.countryRepo.findOne({where:{id}}) ; 
    if(!country){
      return `country with id: ${id} not found..!`
    } else{
      Object.assign(country , updateCountryDto) ; 
      return this.countryRepo.save(country) ; 
    }  
  }

  async removeCountry(id: number):Promise <void>  {
       await this.countryRepo.delete(id); 
  }
}
