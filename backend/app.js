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

io.on("connection", (socket) => {
    if (fs.existsSync(LOG_FILE_PATH)){
        socket.emit("init", fs.readFileSync(LOG_FILE_PATH, 'utf-8'));
    }
})