import '@/assets/base.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
//引入elementplus
import ElementPlus from 'element-plus'
//引入中文语言包
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
//引入持久化插件
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import focus from './directives/focus'
//创建pinia实例
const pinia = createPinia()
//使用持久化插件
pinia.use(piniaPluginPersistedstate)


import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(focus)
//使用elementplus，并设置语言为中文
app.use(ElementPlus, {
  locale: zhCn,
})

app.mount('#app')
