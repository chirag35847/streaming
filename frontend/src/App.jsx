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
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(()=>{
    socket.on("init", (data) => {
      setLogs(data.split("\n").filter(log=>log.trim()))
    })

    socket.on("user-count", (count)=>setUserCount(count))

    socket.on("your-id", (id) => setMyId(id))

    socket.on("private-message", (msg) => {
      setLogs(prev => [...prev, `[PRIVATE]: ${msg}`])
    })

    socket.on("update", (data) => {
      setLogs(prev => [...prev, ...data.split("\n").filter(log=>log.trim())])
    })

    socket.on("user-typing", ({id, isTyping}) => {
      console.log(id, isTyping)
      setTypingUsers(prev => {
        if(isTyping) {
          return [...new Set([...prev, id])]
        }
        return prev.filter(u => u !== id);
      });
    })

    return () => socket.off()
  },[])



  const sendBrodcast = () => {
    socket.emit("send-brodcast", message)
    setMessage("");
  }

  const sendPrivate = () => {
    socket.emit("send-private", {targetId, message})
    setMessage();
  }

  useEffect(()=> {
    if(message) {
      socket.emit("typing", true);
      const timout = setTimeout(() => socket.emit("typing", false), 2000)
      return () => clearTimeout(timout)
    } else {
      socket.emit("typing", false);
    }
  },[message])

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

     <div>
      {typingUsers.length>0 && `${typingUsers.join(", ")} ${typingUsers.length>1 ? "are": "is"} typing...`}
     </div>


     <input value={message} placeholder="Message..." onChange={e => setMessage(e.target.value)}></input>
     <button onClick={sendBrodcast}>Brodcast</button>
     <input value={targetId} placeholder="Target Id.." onChange={e => setTargetId(e.target.value)}></input>
     <button onClick={sendPrivate}>Private</button>
    </>
  )
}

export default App
