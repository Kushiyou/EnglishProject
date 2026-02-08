import layout from '@/layout/index.vue';
import Home from '@/views/Home/index.vue';

export default [
    {
        path: '/',
        name: '',
        component: layout,
        children: [
            {
                path: '/',
                name: '',
                component: Home,
            }
        ]
    }
] 
