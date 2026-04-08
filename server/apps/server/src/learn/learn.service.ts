import { Injectable } from '@nestjs/common';
import { PrismaService, ResponseService } from '@libs/shared';

@Injectable()
export class LearnService {

  constructor(private readonly prisma: PrismaService, private readonly responseService: ResponseService) { }

  //保存单词到wordBookRecord
  async saveWordMaster(wordIds: string[], userId: string) {
    //1.保存到wordBookRecords
    const wordBookRecords = wordIds.map(wordId => ({
      wordId: wordId,
      userId: userId,
      isMaster: true
    }))
    await this.prisma.wordBookRecord.createMany({
      data: wordBookRecords
    })
    //2.更新用户掌握单词数量
    const user = await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        wordNumber: {
          increment: wordIds.length //累加
        }
      }
    })
    return this.responseService.success({ wordNumber: user.wordNumber })
  }

  //读取单词列表
  async getWordList(id: string, userId: string) {
    //1.判断用户是否已经购买课程
    const courseRecord = await this.prisma.courseRecord.findFirst({
      where: {
        userId: userId,
        courseId: id,
        isPurchased: true
      },
      include: {
        course: true
      }
    })

    //如果没找到，则是非法请求
    if (!courseRecord) {
      return this.responseService.error(null, '非法请求')
    }
    const courseType = courseRecord.course.value
    const word = await this.prisma.wordBook.findMany({
      where: {
        [courseType]: true,
        //掌握的单词不应该被查出来了
        wordBookRecords: {
          none: {
            userId: userId
          }
        }
      },
      skip: 0,
      take: 10,
      orderBy: {
        frq: 'desc'
      }
    })
    return this.responseService.success(word)
  }
}
