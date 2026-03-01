import { Injectable, OnModuleInit } from '@nestjs/common';
import { createDeepSeek, createChatpoint, createDeepSeekReasoner, creatBochaSearch } from "../llm/llm.config"
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
  //private agents: Map<ChatRoleType, ReactAgent> = new Map() ---要动态创建agent

  async findAll(useId: string, role: ChatRoleType) {
    //根据id来获取历史记录
    const message = await this.checkpointer.get({
      configurable: {
        thread_id: `${useId}-${role}`
      }
    })
    const list = message?.channel_values?.messages as AIMessageChunk[]
    if (!list) return this.responseService.success([]) //如果历史记录为空，则返回空数组
    return this.responseService.success(list.map(item => ({
      content: item.content,
      role: item.type,
      reasoning: item.additional_kwargs?.reasoning_content, //返回深度思考的内容
    })))
  }

  async streamCompletion(chatDto: ChatDto) {
    const promptObject = chatMode.find(item => item.role === chatDto.role)
    if (!promptObject) {
      throw new Error("模型不存在")
    }
    //拿到基础提示词
    let prompt = promptObject.prompt
    
    //如果开启了联网搜索，则获取联网提示词
    if (chatDto.webSearch) {
      const webSearchPrompt = creatBochaSearch(chatDto.content)
      //拼接提示词
      prompt += `请根据以下搜索结果回答问题：${webSearchPrompt}(并且返回你参考的网站名称)，用户问题：${chatDto.content}`
    }
    //创建agent
    let model = createDeepSeek() //默认是对话模型
    if(chatDto.deepThink){
      model = createDeepSeekReasoner() //深度思考模型
    }
    const agent = createAgent({
      model: model,//模型
      systemPrompt: prompt,//提示词
      checkpointer: this.checkpointer,//检查点，会将历史记录存入数据库
    })
    //1.获取前端传来的agent
    //const agent = this.agents.get(chatDto.role)
    // if (!agent) {
    //   throw new Error("所选agent模式不存在")
    // }
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
    // for (let mode of chatMode) {
    //   let agent = createAgent({
    //     model: createDeepSeek(),//模型
    //     systemPrompt: mode.prompt,//提示词
    //     checkpointer: this.checkpointer,//检查点，会将历史记录存入数据库
    //   })
    //   this.agents.set(mode.role, agent)
    // }
    //不需要上面的了，因为用户可能会开启联网搜索，就不能预先创建好了
  }
}
