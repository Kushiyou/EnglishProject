import { Injectable } from '@nestjs/common';
import { chatMode } from './prompt.mode'
import { ResponseService } from '@libs/shared';

@Injectable()
export class PromptService {
  constructor(private readonly responseService: ResponseService) { }

  findAll() {
    //返回mode列表并且过滤提示词
    return this.responseService.success(chatMode.map((item) => {
      return {
        role: item.role, //角色
        label: item.label, //标签
        id: item.id //id
      }
    }));
  }

}
