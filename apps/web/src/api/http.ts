import axios from 'axios';
export const http = axios.create({ baseURL:'/api', withCredentials:true, timeout:30000 });
http.interceptors.response.use(r=>r, error=>{ if(error.response?.status===401 && location.pathname.startsWith('/admin')) location.href='/login'; return Promise.reject(error); });
export const messageOf=(error:any)=>error?.response?.data?.message||error?.message||'操作失败';
