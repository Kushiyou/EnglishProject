import { Injectable } from '@nestjs/common';
import { PrismaService, ResponseService } from '@libs/shared';
import { TradeStatus } from '@libs/shared/generated/prisma/enums';
@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService, private readonly response: ResponseService) { }

  async findAll() {
    //查询课程表的数据
    const course = await this.prisma.course.findMany()
    const list = course.map((item) => {
      return {
        ...item,
        price: Number(item.price).toFixed(2)
      }
    })
    return this.response.success(list);
  }

  async findMyCourse(userId: string) {
    //查询课程表的数据
    const courseRecords = await this.prisma.courseRecord.findMany({
      where: {
        userId,
        paymentRecord: {
          tradeStatus: TradeStatus.TRADE_SUCCESS
        }
      },
      include: {
        course: true
      }
    });
    const list = courseRecords.map(item => ({
      ...item.course,
      price: Number(item.course.price).toFixed(2)
    }));
    return this.response.success(list);
  }
}
