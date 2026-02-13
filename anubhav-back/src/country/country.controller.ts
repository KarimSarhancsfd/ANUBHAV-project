import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CountryService } from './country.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { Country } from './entities/country.entity';

@Controller('country')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Post()
  create(@Body() createCountryDto: CreateCountryDto):Promise <Country> {
    return this.countryService.createCountry(createCountryDto);
  }

  @Get()
  findAll():Promise <Country[]> {
    return this.countryService.findAllCountry();
  }

  @Get(':id')
  findOne(@Param('id') id: string):Promise <Country | string> {
    return this.countryService.findOneCountry(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCountryDto: UpdateCountryDto):Promise <Country | string> {
    return this.countryService.updateCountry(+id, updateCountryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string):Promise <void>  {
    return this.countryService.removeCountry(+id);
  }
}
