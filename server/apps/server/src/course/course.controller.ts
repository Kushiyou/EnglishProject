import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import { AuthGuard } from '@libs/shared/auth/auth.guard';
import type { Request } from 'express';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) { }

  @Get('list')
  findAll() {
    return this.courseService.findAll();
  }

  @Get('my')
  @UseGuards(AuthGuard)
  findMyCourse(@Req() req: Request) {
    return this.courseService.findMyCourse(req.user.userId);
  }
}
