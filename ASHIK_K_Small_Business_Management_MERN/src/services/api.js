const BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const TOKEN_KEY='sbms_auth_token';
export const tokenStore={get:()=>localStorage.getItem(TOKEN_KEY),set:(v)=>v?localStorage.setItem(TOKEN_KEY,v):localStorage.removeItem(TOKEN_KEY)};
export async function request(path,{method='GET',body}={}) {
  let response;
  try { response=await fetch(`${BASE}${path}`,{method,headers:{'Content-Type':'application/json',...(tokenStore.get()?{Authorization:`Bearer ${tokenStore.get()}`}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})}); }
  catch {throw new Error('Cannot reach backend. Start npm run backend:dev and check MongoDB.');}
  let data=await response.json().catch(()=>({}));
  if (!response.ok) {const e=new Error(data.message||`Request failed: ${response.status}`);e.status=response.status;throw e;}
  return data;
}
