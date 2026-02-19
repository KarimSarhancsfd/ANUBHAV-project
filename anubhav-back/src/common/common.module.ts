import { Global, Module } from '@nestjs/common';
import { AppCacheService } from './cache/app-cache.service';

/**
 * PERF: CommonModule is marked @Global so AppCacheService
 * can be injected in any module without re-importing CommonModule.
 * This is the correct NestJS pattern for shared infrastructure services.
 */
@Global()
@Module({
  providers: [AppCacheService],
  exports: [AppCacheService],
})
export class CommonModule {}
