//引入deepseek
import { ChatDeepSeek } from "@langchain/deepseek";
import { ConfigService } from "@nestjs/config";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres"

const configServer = new ConfigService()

export const createDeepSeek = ()=>{
    return new ChatDeepSeek({
        apiKey: configServer.get<string>("DEEPSEEK_API_KEY"),
        model: configServer.get<string>("DEEPSEEK_API_MODEL"),
        temperature: 1.3,
        maxTokens: 5000, //一个中文大概2个token
        streaming: true 
    })
}

//初始化chatpoint 来做会话隔离
export const createChatpoint = async ()=>{
    const configService = new ConfigService();
    const chatpointer = PostgresSaver.fromConnString(configServer.get<string>("AI_DATABASE_URL")!)
    await chatpointer.setup()
    return chatpointer
}