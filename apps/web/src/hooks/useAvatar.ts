import { useUserStore } from '@/stores/user';
import { uploadUrl } from '@/apis/index';
import defaultAvatar from '@/assets/images/avatar/default-avatar.png' //默认头像
import { computed } from 'vue'

export function useAvatar() {
    const userStore = useUserStore();
    const avatar = computed(() => {
        if (userStore.getUser?.avatar) {
            return uploadUrl + userStore.getUser.avatar; // 拼接完整的头像URL
        } else {
            return defaultAvatar; // 返回默认头像URL
        }
    })

    const customAvatar = (avatarPath: string) => {
        if (avatarPath) {
            return uploadUrl + avatarPath; // 拼接完整的头像URL
        } else {
            return defaultAvatar; // 返回默认头像URL
        }
    }

    return {
        avatar,
        customAvatar,
    }
}