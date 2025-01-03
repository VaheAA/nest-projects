import {
  Body,
  Controller,
  Post,
  UseGuards,
  Patch,
  Param,
  Get,
  Query,
} from '@nestjs/common'
import { CreateReportDto } from './dtos/create-report.dto'
import { ReportsService } from './reports.service'
import { AuthGuard } from '../guards/auth.guard'
import { AdminGuard } from '../guards/admin.guard'
import { CurrentUser } from '../users/decorators/current-user.decorator'
import { User } from '../users/user.entity'
import { ReportDto } from './dtos/report.dto'
import { Serialize } from '../interceptors/serialize.interceptor'
import { ApproveReportDto } from './dtos/approve-report.dto'
import { GetEstimateDto } from './dtos/get-estimate.dto'

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportService: ReportsService) {}

  @Get()
  getEstimate(@Query() query: GetEstimateDto) {}

  @Post()
  @UseGuards(AuthGuard)
  @Serialize(ReportDto)
  createReport(@Body() body: CreateReportDto, @CurrentUser() user: User) {
    return this.reportService.create(body, user)
  }

  @Patch('/:id')
  @UseGuards(AdminGuard)
  approveReport(@Param('id') id: string, @Body() body: ApproveReportDto) {
    return this.reportService.changeApproval(id, body.approved)
  }
}
