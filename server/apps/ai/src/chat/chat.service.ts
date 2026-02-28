import { Injectable, OnModuleInit } from '@nestjs/common';
import { createDeepSeek, createChatpoint } from "../llm/llm.config"
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import type { AIMessageChunk, ReactAgent } from 'langchain'
import { chatMode } from '../prompt/prompt.mode';
import { createAgent } from 'langchain'
import { ResponseService } from '@libs/shared';
import { ChatDto, ChatRoleType } from '@en/common/chat';

//OnModuleInit是实现声明周期的这里可以初始化聊天记录仓库的初始化
@Injectable()
export class ChatService implements OnModuleInit {
  constructor(private readonly responseService: ResponseService) { }

  private checkpointer: PostgresSaver
  private agents: Map<ChatRoleType, ReactAgent> = new Map()

  async findAll(useId: string, role: ChatRoleType) {
    //根据id来获取历史记录
    const message = await this.checkpointer.get({
      configurable: {
        thread_id: `${useId}-${role}`
      }
    })
    const list = message?.channel_values?.messages as AIMessageChunk[]
    if(!list) return this.responseService.success([]) //如果历史记录为空，则返回空数组
    return this.responseService.success(list.map(item => ({
      content: item.content,
      role: item.type,
    })))
  }

  streamCompletion(chatDto: ChatDto) {
    //1.获取前端传来的agent
    const agent = this.agents.get(chatDto.role)
    if (!agent) {
      throw new Error("所选agent模式不存在")
    }
    //组装消息格式
    const id = `${chatDto.userId}-${chatDto.role}`
    const stream = agent.stream({
      messages: [{
        role: "human",
        content: chatDto.content
      }]
    }, {
      streamMode: "messages",//流式输出
      configurable: { thread_id: id }//用于会话隔离+历史记录存储
    })
    return stream //是一个迭代器
  }

  async onModuleInit() {
    //初始化chatpoint
    this.checkpointer = await createChatpoint()//不会重复创建的--幂等性
    //创建多个agent因为一个agent只能有一个提示词
    for (let mode of chatMode) {
      let agent = createAgent({
        model: createDeepSeek(),//模型
        systemPrompt: mode.prompt,//提示词
        checkpointer: this.checkpointer,//检查点，会将历史记录存入数据库
      })
      this.agents.set(mode.role, agent)
    }
  }
}
