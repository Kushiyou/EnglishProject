import { Injectable } from '@nestjs/common';
import type { WordList, WordQuery, Word } from '@en/common/word';
import { PrismaService, ResponseService } from '@libs/shared';
//引入Prisma的类型定义，方便后续构建查询条件时使用
import type { Prisma } from '@libs/shared/generated/prisma/client';

@Injectable()
export class WordBookService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly responseService: ResponseService,
  ) {}

  private toBoolean(value: string | boolean | undefined): boolean | undefined {
    return value === "true" ? true : undefined; // 只将 "true" 转换为 true，其他值都返回 undefined
  }

  async findAll(query: WordQuery) {
    const { page=1, pageSize=12, word, ...rest } = query;

    //将获取的字符串类型转换为真正的布尔值，方便后续查询
    const tags = Object.fromEntries(
      Object.entries(rest).map(([key, value]) => [key, this.toBoolean(value)])
    )
    //构建查询条件
    //WordBookWhereInput 是 Prisma 自动生成的类型，表示对 WordBook 表进行查询时可以使用的条件
    const where: Prisma.WordBookWhereInput = {
      word: word ? { contains: word } : undefined,//如果提供了单词查询参数，则使用 contains 模式进行模糊匹配
      ...tags
    }
    // //首先获取满足条件的单词总数，以便前端进行分页展示
    // const total = await this.prisma.wordBook.count({ where })
    // //根据查询条件获取当前页的单词列表，使用 skip 和 take 实现分页，并根据频率降序排序，确保高频单词优先展示
    // const list = await this.prisma.wordBook.findMany({
    //   where,
    //   skip: Number((page - 1) * Number(pageSize)),
    //   take: Number(pageSize),
    //   orderBy: { frq: 'desc' },//根据频率降序排序，确保高频单词优先展示
    // });
    //使用 Promise.all 同时执行获取总数和获取列表的两个异步操作，提升性能
    const [total,list] = await Promise.all([
      this.prisma.wordBook.count({ where }),
      this.prisma.wordBook.findMany(
        { 
          where, 
          skip: Number((page - 1) * Number(pageSize)), //计算跳过的记录数
          take: Number(pageSize), //获取当前页的记录数
          orderBy: { frq: 'desc' } 
        })
    ])
    
    return this.responseService.success({total,list});
  }
}
