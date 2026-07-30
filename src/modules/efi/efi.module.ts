import { Module } from '@nestjs/common';
import { EfiService } from './efi.service';

@Module({
  providers: [EfiService],
  exports: [EfiService],
})
export class EfiModule {}
