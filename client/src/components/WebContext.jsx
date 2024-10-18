import { createContext, useContext, useEffect, useState } from 'react'
import {io} from 'socket.io-client'

const WebsocketContext=createContext(null);

export const WebsocketProvider=({children})=>{
    const [socket,setSocket]=useState(null);

    useEffect(()=>{
        const newsocket=io('http://localhost:5007')
        setSocket(newsocket)
        
        return ()=>{
            if(newsocket){
                newsocket.disconnect();
            }
        };
    },[]);

    return(
        <WebsocketContext.Provider value={socket}>
            {children}
        </WebsocketContext.Provider>
    )
}
export const useWebsocket =()=> useContext(WebsocketContext);