import type { ChatModeList, ChatMessageList, ChatRoleType } from "@en/common/chat";
import { serverAi, type Respone } from "..";

//获取ai模式列表
export const getChatMode = () => {
    return serverAi.get('/prompt/list') as Promise<Respone<ChatModeList>>
}

//获取历史记录

export const getChatHistory = (userId: string, role: ChatRoleType) => {
    return serverAi.get(`/chat/history?userId=${userId}&role=${role}`) as Promise<Respone<ChatMessageList>>
}