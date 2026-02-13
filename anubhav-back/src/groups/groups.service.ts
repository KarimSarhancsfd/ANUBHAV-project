import { Injectable , HttpException, HttpStatus} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import { Group } from './entities/group.entity';
import { CreateGroupsDto } from './dto/create-group.dto';
import { UpdateGroupsDto } from './dto/update-group.dto';



@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    public userRepository: Repository<Group> 
  ){}
 async create(createGroupsDto: CreateGroupsDto) {

  try{
    const newGROUPS = this.userRepository.create(createGroupsDto);
    const savedGROUPS = await this.userRepository.save(newGROUPS);
    return savedGROUPS;
  }catch (error: any){
      if (error.code === 'ER_DUP_ENTRY'){

        throw new HttpException('Duplicate entry : A user with this unique field already exists.', HttpStatus.CONFLICT);
      }
      if(error.code === 'QUERY_FAILEDError'){
        throw new HttpException(`Query failed:  + ${error.message}`, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(error.message || 'Failed to create user',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
  }
}

 async findAll(){
    try{
      return await this.userRepository.find();
    }catch (error: any){
      if (error.code === 'ER_DUP_ENTRY'){

        throw new HttpException('Duplicate entry : A user with this unique field already exists.', HttpStatus.CONFLICT);
      }
      if(error.code === 'QUERY_FAILEDError'){
        throw new HttpException(`Query failed:  + ${error.message}`, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(error.message || 'Failed to create user',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }
  

 async findOne(id: number) {
   try {
    return await this.userRepository.findOneBy({id});
    
   } catch (error) {
     if (error.code === 'ER_DUP_ENTRY'){

        throw new HttpException('Duplicate entry : A user with this unique field already exists.', HttpStatus.CONFLICT);
      }
      if(error.code === 'QUERY_FAILEDError'){
        throw new HttpException(`Query failed:  + ${error.message}`, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(error.message || 'Failed to create user',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
   }
  }


  async update(id: number, updateGroupsDto: UpdateGroupsDto) {
    try{
       const updateResult = await this.userRepository.update(id, updateGroupsDto);
       if (updateResult.affected === 0) {
         throw new HttpException('Groups not found', HttpStatus.NOT_FOUND);
       }
    }catch (error) {
     if (error.code === 'ER_DUP_ENTRY'){

        throw new HttpException('Duplicate entry : A user with this unique field already exists.', HttpStatus.CONFLICT);
      }
      if(error.code === 'QUERY_FAILEDError'){
        throw new HttpException(`Query failed:  + ${error.message}`, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(error.message || 'Failed to create user',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
   }
  }

 async remove(id: number) {

     try{
       const deleteResult = await this.userRepository.delete(id);
       if (deleteResult.affected === 0) {
         throw new HttpException('Groups not found', HttpStatus.NOT_FOUND);
       }
    }catch (error) {
     if (error.code === 'ER_DUP_ENTRY'){

        throw new HttpException('Duplicate entry : A user with this unique field already exists.', HttpStatus.CONFLICT);
      }
      if(error.code === 'QUERY_FAILEDError'){
        throw new HttpException(`Query failed:  + ${error.message}`, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(error.message || 'Failed to create user',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
   }
    
  }
}


