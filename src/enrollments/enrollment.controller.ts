import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EnrollmentService } from './enrollment.service';

@ApiTags('enrollment')
@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly service: EnrollmentService) {}
}
