import '@/assets/base.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import focus from './directives/focus'

import App from './App.vue'
import router from './router'

// 1. 创建 Pinia 实例
const pinia = createPinia()

// 2. 注册持久化插件
pinia.use(piniaPluginPersistedstate)

// 3. 创建 Vue 应用
const app = createApp(App)

// 4. 使用同一个 Pinia 实例（上面创建的那个）
app.use(pinia)  // ✅ 使用已经注册了插件的实例
app.use(router)
app.use(focus)

// 5. 使用 ElementPlus
app.use(ElementPlus, {
  locale: zhCn,
})

app.mount('#app')