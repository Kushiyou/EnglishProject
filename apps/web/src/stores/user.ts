import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { WebResultUser } from '@en/common/user'

export const useUserStore = defineStore('user', () => {
  const user = ref<WebResultUser | null>(null)
  const setUser = (params:WebResultUser)=>{
    user.value = params
  }
  const getUser = computed(() => user.value)
  const logout = () => {
    user.value = null
  }

  return { user, setUser, getUser, logout }
},{
  persist: true, //启用持久化，将用户信息保存在localStorage中，刷新页面后仍然保持登录状态
})
