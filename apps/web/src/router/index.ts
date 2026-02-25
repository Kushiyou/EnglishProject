import { createRouter, createWebHistory } from 'vue-router'
import home from './Home/index.ts'
import wordbook from './WordBook/index.ts'
import setting from './Setting/index.ts'
import chat from './Chat/index.ts'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...home,//主页
    ...wordbook,//单词本
    ...setting,//设置
    ...chat,//聊天
  ],
})

export default router
