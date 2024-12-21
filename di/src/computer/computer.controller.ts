import { Controller, Get } from '@nestjs/common'
import { CpuService } from '../cpu/cpu.service'
import { DiskService } from '../disk/disk.service'

@Controller('computer')
export class ComputerController {
  constructor(
    private diskService: DiskService,
    private cpuService: CpuService,
  ) {}

  @Get()
  run() {
    return [this.cpuService.compute(5, 10), this.diskService.getData()]
  }
}
