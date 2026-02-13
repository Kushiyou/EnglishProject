import { onMounted, type App, type Plugin } from 'vue'

export default {
    install(app: App) {
        app.directive('focus', {
            mounted(e: HTMLElement) {
                e.focus()
            }
        })
    }
} as Plugin