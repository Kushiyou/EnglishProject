import type { ChatModeList } from "@en/common/chat";
import { serverAi, type Respone } from "..";

export const getChatMode = () => {
 return serverAi.get('/prompt/list') as Promise<Respone<ChatModeList>>
}