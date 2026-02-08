import express from 'express'
import cors from 'cors'
import { Server } from 'socket.io';
import fs from "fs";
import chokidar from "chokidar";

const app = express();
app.use(cors())

const LOG_FILE_PATH = './logs.txt'
let lastReadSize = fs.existsSync(LOG_FILE_PATH) ? fs.statSync(LOG_FILE_PATH).size : 0;


const server = app.listen(8000, ()=> {
    console.log("Server running on port 8000")
})

const io = new Server(server, {
    cors: {origin: "*"}
})

const brocastUserCount = () => {
    io.emit("user-count", io.engine.clientsCount)
}

io.on("connection", (socket) => {
    socket.emit("your-id", socket.id)
    io.emit("update", `[SYSTEM] User ${socket.id} joined the chat`)
    brocastUserCount();
    if (fs.existsSync(LOG_FILE_PATH)){
        socket.emit("init", fs.readFileSync(LOG_FILE_PATH, 'utf-8'));
    }

    socket.on("send-brodcast", (msg) => {
        const message = `[USER ${socket.id}]: ${msg}`
        io.emit("update", message + "\n")
    })

    socket.on("send-private", ({targetId, message})=> {
        io.to(targetId).emit("private-message", `From ${socket.id}: ${message}`)
    })

    socket.on("typing", (isTyping) => {
        // console.log(socket.id, isTyping)
        socket.broadcast.emit("user-typing", {id: socket.id, isTyping});
    })

    socket.on("disconnect", () => {
        brocastUserCount();
        io.emit("update", `[SYSTEM] User ${socket.id} left the chat`)
    })
})

const watcher = chokidar.watch(LOG_FILE_PATH, {persistent: true});
watcher.on("change", (path) => {
    const stats = fs.statSync(path);
    const newSize = stats.size;
    if(newSize > lastReadSize) {
        const stream = fs.createReadStream(path, {start: lastReadSize, end: newSize - 1});
        stream.on("data", (data)=>io.emit("update", data.toString()));
        console.log("update")
    } else if(newSize < lastReadSize) {
        io.emit("init", fs.readFileSync(path, 'utf-8'));
    }

    lastReadSize = newSize;
})