import { createRouter,createWebHistory } from 'vue-router'; import { useAuthStore } from '@/stores/auth';
const router=createRouter({history:createWebHistory(),routes:[
 {path:'/login',component:()=>import('@/views/LoginView.vue')},
 {path:'/admin',component:()=>import('@/layouts/AdminLayout.vue'),meta:{auth:true},children:[{path:'',redirect:'/admin/videos'},{path:'videos',component:()=>import('@/views/VideosView.vue')},{path:'users',component:()=>import('@/views/UsersView.vue'),meta:{super:true}}]},
 {path:'/watch/:id',component:()=>import('@/views/PlayerView.vue')},{path:'/:pathMatch(.*)*',redirect:'/admin'}
]});
router.beforeEach(async to=>{ if(!to.meta.auth)return true; const auth=useAuthStore(); if(!auth.user&&!await auth.load())return `/login?redirect=${encodeURIComponent(to.fullPath)}`; if(to.meta.super&&auth.user?.role!=='SUPER_ADMIN')return'/admin/videos'; return true; }); export default router;
