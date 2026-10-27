import React,{createContext,useContext,useEffect,useState} from 'react';
import {request,tokenStore} from '../services/api.js';
const Context=createContext(null);
export function AuthProvider({children}) {
 const [user,setUser]=useState(null),[loading,setLoading]=useState(true);
 useEffect(()=>{let active=true;(async()=>{try {if(tokenStore.get()){const data=await request('/auth/me');if(active)setUser(data.user);}}catch{tokenStore.set(null);}finally{if(active)setLoading(false);}})();return()=>{active=false;};},[]);
 const login=async(email,password)=>{const data=await request('/auth/login',{method:'POST',body:{email,password}});tokenStore.set(data.token);setUser(data.user);};
 const register=async(name,email,password,businessName)=>{const data=await request('/auth/register',{method:'POST',body:{name,email,password,businessName}});tokenStore.set(data.token);setUser(data.user);};
 const logout=()=>{tokenStore.set(null);setUser(null);};
 return <Context.Provider value={{user,loading,login,register,logout}}>{children}</Context.Provider>;
}
export const useAuth=()=>useContext(Context);
