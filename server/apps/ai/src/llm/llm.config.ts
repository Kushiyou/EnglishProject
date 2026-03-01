//引入deepseek
import { ChatDeepSeek } from "@langchain/deepseek";
import { ConfigService } from "@nestjs/config";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres"

const configServer = new ConfigService()
//普通对话的模型
export const createDeepSeek = () => {
    return new ChatDeepSeek({
        apiKey: configServer.get<string>("DEEPSEEK_API_KEY"),
        model: configServer.get<string>("DEEPSEEK_API_MODEL"),
        temperature: 1.3,
        maxTokens: 5000, //一个中文大概2个token
        streaming: true
    })
}
//深度思考的模型
export const createDeepSeekReasoner = () => {
    return new ChatDeepSeek({
        apiKey: configServer.get<string>("DEEPSEEK_API_KEY"),
        model: configServer.get<string>("DEEPSEEK_REASONER_API_MODEL"),
        temperature: 1.3,
        maxTokens: 20000, //一个中文大概2个token
        streaming: true
    })
}

//初始化chatpoint 来做会话隔离
export const createChatpoint = async () => {
    const configService = new ConfigService();
    const chatpointer = PostgresSaver.fromConnString(configServer.get<string>("AI_DATABASE_URL")!)
    await chatpointer.setup()
    return chatpointer
}

//初始化博查搜索API
export const creatBochaSearch = async (query: string, count: number = 10) => {
    /*
        - query: 搜索关键词
        - freshness: 搜索的时间范围
        - summary: 是否显示文本摘要
        - count: 返回的搜索结果数量
     */

    const configService = new ConfigService();
    const result = await fetch(`${configService.get<string>("BOCHA_SEARCH_URL")}`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${configService.get<string>("BOCHA_API_KEY")}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: query,
            summary: true, // 是否返回长文本摘要
            count: count
        })
    })
    const { data } = await result.json()
    //拼接提示词
    const values = data.webPages.value //博查返回的互联网搜索
    //开始拼接
    const prompt = values.map((item)=>{
        return `
       标题：${item.name}
       链接：${item.url}
       摘要：${item?.summary?.replace(/\n/g, '') ?? ''}
       网站名称：${item.siteName}
       网站logo：${item.siteIcon}
       发布时间：${item.dateLastCrawled}
    `
    }).join('\n')
    return prompt
}