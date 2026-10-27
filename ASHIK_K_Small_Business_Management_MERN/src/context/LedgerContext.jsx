import React, {createContext,useContext,useEffect,useMemo,useState} from 'react';
import {DEFAULT_PERIOD,PERIODS} from '../domain/finance.js';
import {request} from '../services/api.js';
const Context=createContext(null);
const empty={version:1,sales:[],expenses:[]};
export function LedgerProvider({children}){
 const [data,setData]=useState(empty);const [periodId,setPeriodId]=useState(DEFAULT_PERIOD);const [warning,setWarning]=useState('');const [loading,setLoading]=useState(true);
 const period=useMemo(()=>PERIODS.find(x=>x.id===periodId)||PERIODS.at(-1),[periodId]);
 async function refresh(){try {const result=await request('/ledger');setData(result);setWarning('');}catch(e){setWarning(e.message);if(e.status===401)window.location.reload();}finally{setLoading(false)}}
 useEffect(()=>{refresh();},[]);
 async function addRecord(kind,input){if(input.date<period.from||input.date>period.to)throw new Error('Choose a date within the selected period.');await request(`/${kind}`,{method:'POST',body:input});await refresh();return '';}
 async function deleteRecord(kind,id){await request(`/${kind}/${id}`,{method:'DELETE'});await refresh();}
 async function updateRecord(kind,id,input){await request(`/${kind}/${id}`,{method:'PUT',body:input});await refresh();}
 return <Context.Provider value={{data,period,setPeriodId,warning,loading,addRecord,deleteRecord,updateRecord,refresh}}>{children}</Context.Provider>;
}
export const useLedger=()=>useContext(Context);
