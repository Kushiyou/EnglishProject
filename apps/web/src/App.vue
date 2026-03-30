<template>
  <RouterView />
  <Search />
  <Login />
</template>
<script setup lang="ts">
import { RouterView } from 'vue-router';
import Search from './components/Search/index.vue'
import Login from './components/Login/index.vue'
import { provide, ref, watch } from 'vue'
import { IS_SHOW_LOGIN } from './components/Login/type'
//引入useSocket
import { useSocket } from './hooks/useSocket';
import { useUserStore } from './stores/user';
const { connect, disconnect } = useSocket()
const userStore = useUserStore()
//监听userId
watch(() => userStore.user?.id, (newValue) => {
  if (newValue) {
    connect()
  } else {
    disconnect()
  }
}, { immediate: true })

provide(IS_SHOW_LOGIN, ref(false)) // 是否显示登录框 并且扩展为全局调用 默认不显示
</script>