import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from "@repo/backend-common/config"

const wss = new WebSocketServer({port: 8080})

wss.on('connection', function conection(ws, request) {

    const url = request.url //ws:localhost:3000?token=123546
    // ["ws:localhost:3000", "token=123456"]
    if(!url) return

    const queryParams = new URLSearchParams(url.split('?')[1]); //splits the url into array, taking the first index therefore "token=123456" as the queryParams
    const token = queryParams.get('token') || "";
    const decoded = jwt.verify(token, JWT_SECRET)

    if(!decoded || !(decoded as JwtPayload).userId) {
        ws.close()
        return
    }

    ws.on('message', function message(data) {
        ws.send("something")
    })

})