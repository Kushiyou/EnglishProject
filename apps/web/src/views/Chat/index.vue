<template>
    <div class="w-[1200px] mx-auto flex mt-10">
        <Conversations @onGetRole="getRole" />
        <Bubble :list="list" @onSendMessage="sendMessage" />
    </div>
</template>
<script setup lang="ts">
import Conversations from './components/Conversations.vue'
import Bubble from './components/Bubble.vue'
import { ref } from 'vue';
import { getChatHistory } from '@/apis/chat/index'
import { useUserStore } from '@/stores/user';
import type { ChatMessageList, ChatRoleType, ChatMessage, ChatDto } from '@en/common/chat';
import { sse, CHAT_URL } from '@/apis/sse'

const userStore = useUserStore()
const userId = userStore.user?.id
const list = ref<ChatMessageList>([])//历史记录
const role = ref<ChatRoleType>('normal') //存储角色

const getRole = async (params: ChatRoleType) => {
    role.value = params
    const res = await getChatHistory(userStore.user?.id!, params)
    list.value = res.data
}

const sendMessage = (message:string) => {
    list.value.push({role: 'human', content: message}) //添加用户的消息
    list.value.push({role: 'ai', content: ''}) //添加AI的消息
    console.log(list.value);
    
    sse<ChatMessage, ChatDto>(CHAT_URL, "POST", {role: role.value, content: message, userId: userId!
    }, (data) => {
        list.value[list.value.length - 1].content += data.content
    })
}


</script>