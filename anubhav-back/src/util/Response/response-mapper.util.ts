export function mapEntityToDto<EntityType extends object, DtoType>(entity: EntityType, dtoClass: new (...args: any[]) => DtoType): DtoType {
    const keys = Object.keys(entity);
    const values = keys.map(key => (entity as any)[key]);
    return new dtoClass(...values);
  }
  
  export function mapEntitiesToDtos<EntityType extends object, DtoType>(entities: EntityType[], dtoClass: new (...args: any[]) => DtoType): DtoType[] {
    return entities.map(entity => mapEntityToDto(entity, dtoClass));
  }
  