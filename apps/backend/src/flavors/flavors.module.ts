import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flavor } from './entities/flavor.entity';
import { FlavorsController } from './flavors.controller';
import { FlavorsService } from './flavors.service';

@Module({
  imports: [TypeOrmModule.forFeature([Flavor])],
  controllers: [FlavorsController],
  providers: [FlavorsService],
  exports: [FlavorsService],
})
export class FlavorsModule {}
