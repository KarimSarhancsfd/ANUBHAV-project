/**
 * @file groups.service.ts
 * @description Service for managing group business logic and database operations
 */
import { Injectable , HttpException, HttpStatus} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import { Group } from './entities/group.entity';
import { CreateGroupsDto } from './dto/create-group.dto';
import { UpdateGroupsDto } from './dto/update-group.dto';



@Injectable()
/**
 * Service for managing group operations including CRUD and database interactions
 */
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    public userRepository: Repository<Group> 
  ){}
  /**
   * Creates a new group in the database
   * @param createGroupsDto - The data transfer object containing group creation details
   * @returns The newly created group
   * @throws HttpException with CONFLICT status for duplicate entries
   * @throws HttpException with BAD_REQUEST status for query failures
   * @throws HttpException with INTERNAL_SERVER_ERROR for other errors
   */
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

 /**
   * Retrieves all groups from the database
   * @returns An array of all groups
   * @throws HttpException with CONFLICT status for duplicate entries
   * @throws HttpException with BAD_REQUEST status for query failures
   * @throws HttpException with INTERNAL_SERVER_ERROR for other errors
   */
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
  

 /**
   * Retrieves a single group by its ID
   * @param id - The ID of the group to retrieve
   * @returns The group with the specified ID, or null if not found
   * @throws HttpException with CONFLICT status for duplicate entries
   * @throws HttpException with BAD_REQUEST status for query failures
   * @throws HttpException with INTERNAL_SERVER_ERROR for other errors
   */
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


 /**
   * Updates an existing group
   * @param id - The ID of the group to update
   * @param updateGroupsDto - The data transfer object containing group update details
   * @returns void
   * @throws HttpException with NOT_FOUND status if group doesn't exist
   * @throws HttpException with CONFLICT status for duplicate entries
   * @throws HttpException with BAD_REQUEST status for query failures
   * @throws HttpException with INTERNAL_SERVER_ERROR for other errors
   */
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

 /**
   * Deletes a group from the database
   * @param id - The ID of the group to delete
   * @returns void
   * @throws HttpException with NOT_FOUND status if group doesn't exist
   * @throws HttpException with CONFLICT status for duplicate entries
   * @throws HttpException with BAD_REQUEST status for query failures
   * @throws HttpException with INTERNAL_SERVER_ERROR for other errors
   */
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


