import { Injectable } from '@nestjs/common';
import { PrismaService, ResponseService } from '@libs/shared';

@Injectable()
export class CourseService {
  constructor(private readonly prisma:PrismaService, private readonly response:ResponseService){}

  async findAll() {
    //查询课程表的数据
    const course = await this.prisma.course.findMany()
    const list = course.map((item)=>{
      return {
        ...item,
        price: Number(item.price).toFixed(2)
      }
    })
    return this.response.success(list);
  }
}
