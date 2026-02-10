import { Injectable } from '@nestjs/common';
import type { WordList, WordQuery, Word } from '@en/common/word';
import { PrismaService, ResponseService } from '@libs/shared';

@Injectable()
export class WordBookService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly responseService: ResponseService,
  ) {}

  private toBoolean(value: string | boolean | undefined): boolean | undefined {
    return value === "true" ? true : undefined; // 只将 "true" 转换为 true，其他值都返回 undefined
  }

  findAll(query: WordQuery) {
    const { page=1, pageSize=12, ...rest } = query;
    //将获取的字符串类型转换为真正的布尔值，方便后续查询
    const filteredRest = Object.fromEntries(
      Object.entries(rest).map(([key, value]) => [key, this.toBoolean(value)])
    )
    return this.responseService.success(this.prisma.wordBook.findMany());
  }
}
