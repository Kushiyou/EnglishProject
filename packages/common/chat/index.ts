export type ChatRole = 'human' | 'ai'; // 角色 human: 用户 ai: 助手
export type ChatRoleType = 'normal' | 'master' | 'business' | 'qilinge' | 'xiaochen'; // 角色类型
export type ChatMessageType = 'reasoning' | 'chat';// 消息类型：reasoning推理，chat ：聊天正文
//历史记录所返回的对象
export type ChatMessage = {
    role: ChatRole; // 角色 human: 人类 ai: 机器人
    content: string; // 内容
    type: ChatMessageType; // 目前模型属于什么状态是在深度思考还是聊天
    reasoning?: string //深度思考返回的内容，就是聊天上面的信息
}
//历史记录
export type ChatMessageList = ChatMessage[]
//左侧列表所返回的对象
export type ChatMode = {
    label: string; // 标签
    id: string; // id
    role: ChatRoleType; // 角色
}
//左侧列表所返回的对象列表
export type ChatModeList = ChatMode[] //返回角色列表
//发送消息所需要的对象
export type ChatDto = {
    role: ChatRoleType; // 角色
    content: string; // 内容
    userId: string; // 用户id
    deepThink: boolean; //深度思考
    webSearch: boolean; //联网查询
}