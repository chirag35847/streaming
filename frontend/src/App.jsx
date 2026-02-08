import { useState } from "react"
import { useEffect } from "react"
import io from "socket.io-client"

const socket = io("http://localhost:8000")

function App() {
  const [logs, setLogs] = useState([]);
  const [myId, setMyId] = useState("");
  const [userCount, setUserCount] = useState(0);
  const [message, setMessage] = useState("")
  const [targetId, setTargetId] = useState("")

  useEffect(()=>{
    socket.on("init", (data) => {
      setLogs(data.split("\n").filter(log=>log.trim()))
    })

    socket.on("user-count", (count)=>setUserCount(count))

    socket.on("your-id", (id) => setMyId(id))

    socket.on("update", (data) => {
      console.log("recieved an update")
      setLogs(prev => [...prev, ...data.split("\n").filter(log=>log.trim())])
    })

    return () => socket.off()
  },[])

  const sendBrodcast = () => {
    socket.emit("send-brodcast", message)
    setMessage("");
  }

  const sendPrivate = () => {
    socket.emit("send-private", {taget, message})
    setMessage();
  }

  return (
    <>
      <div>
        My id: {myId}
      </div>
      <div>
        User count: {userCount}
      </div>
     {
      logs.map((line,i)=>(
        <div key={i} className="">
          <span>{line}</span>
        </div>
      ))
     }


     <input value={message} placeholder="Message..." onChange={e => setMessage(e.target.value)}></input>
     <button onClick={sendBrodcast}>Brodcast</button>
     <input value={targetId} placeholder="Target Id.." onChange={e => setTargetId(e.target.value)}></input>
     <button onClick={sendPrivate}>Private</button>
    </>
  )
}

export default App
