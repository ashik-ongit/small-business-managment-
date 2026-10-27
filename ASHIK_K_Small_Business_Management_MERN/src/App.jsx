import React,{useEffect,useState} from 'react';
import Layout,{SCREENS} from './components/Layout.jsx';
import {LedgerProvider} from './context/LedgerContext.jsx';
import {AuthProvider,useAuth} from './context/AuthContext.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Sales from './pages/Sales.jsx';
import Expenses from './pages/Expenses.jsx';
import Reports from './pages/Reports.jsx';
const pages={Dashboard,Sales,Expenses,Reports};
function currentScreen(){return SCREENS.find(name=>window.location.hash===`#/${name.toLowerCase()}`)||'Dashboard';}
function Workspace(){const {user,loading}=useAuth();const [screen,setScreen]=useState(currentScreen);
 useEffect(()=>{const update=()=>{setScreen(currentScreen());window.scrollTo(0,0)};window.addEventListener('hashchange',update);return()=>window.removeEventListener('hashchange',update)},[]);
 useEffect(()=>{document.title=`${screen} | Small Business Management System`},[screen]);
 if(loading)return <div className="loading-page">Loading your workspace...</div>;
 if(!user)return <AuthPage/>;
 const Page=pages[screen];return <LedgerProvider><Layout screen={screen}><Page/></Layout></LedgerProvider>;
}
export default function App(){return <AuthProvider><Workspace/></AuthProvider>}
