import {useState,useEffect} from 'react'
import axios from 'axios'
import { BrowserRouter,Route,Routes,Navigate } from 'react-router-dom';
import LogIn from './components/LogIn';
import User from './components/Userpage';
import HomeContent from './components/Homecontent';
import 'bootstrap/dist/css/bootstrap.min.css';
import SignUp from './components/SignUp';
import { useAuth } from './components/AuthContext';
import Navbar from './components/Navbar';
import './CSS/Navbar.css'
import Industry from './components/Industry';
import Dashboard from './components/Dashboard';
import Notification from './components/Notification';
import Profile from './components/Profile';
import { WebsocketProvider } from './components/WebContext';
import PlantManager from './components/Industry';
import MachineAnalytics from './components/Machineanalytics';
function App() {
  // const [data,setData]=useState([])
  // useEffect(()=>{
  //   axios.get("http://localhost:5000/").then(response=>{
  //     setData(response.data.members);
  //     console.log(response.data.members);
  //   })
  //   .catch(error=>{
  //     console.error("Error fetching the member data: ",error);
  //   });
  // },[])
  //const {isAuthenticated}=useAuth()
  const isAuthenticated=true
  return (
    <div >
      <BrowserRouter>
          <Routes>
              <Route path='/signup' element={<SignUp/>}></Route>
              <Route path='/login' element={<LogIn/>}></Route>
              <Route path='/' element={<User/>}></Route>
              <Route path='/industry' element={<Navbar/>}>
                <Route index element={isAuthenticated?<PlantManager/>:<Navigate to='/login'/>}/>
                <Route path='dashboard' element={isAuthenticated?<Dashboard/>:<Navigate to='/login'/>}/>
                <Route path='notification' element={isAuthenticated?<Notification/>:<Navigate to='/login'/>}/>
                <Route path='profile' element={isAuthenticated?<Profile/>:<Navigate to='/login'/>}/>
              </Route>
                <Route path='machine-analytics/:machineId' element={isAuthenticated ? <MachineAnalytics /> : <Navigate to='/login' />} />
              
          </Routes>
        </BrowserRouter>
        
    </div>
  );
}

export default App;
