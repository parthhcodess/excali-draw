import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { JWT_SECRET } from "@repo/backend-common/config"
import { middleware } from "./middleware.js";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common/types"
import { prismaClient } from "@repo/db/client"

const app = express();
app.use(express.json())

app.post("/signup", async (req, res) => {
    // const requiredbody = z.object({
    //     email: z.string().email(),
    //     password: z.string().min(8)
    // })

    const parsedData = CreateUserSchema.safeParse(req.body);
    if(!parsedData.success) {
        res.json({
            message: "Incorrect Format"
        })
        return
    }

    // const parsedDataWithSuccess = requiredbody.safeParse(req.body);

    // if(!parsedDataWithSuccess.success) {
    //     res.json({
    //         message: "Incorrect Format",
    //         error: parsedDataWithSuccess.error
    //     })
    //     return
    // }

    let errorThrown = false;
    try {
        const hashedPassword = await bcrypt.hash(parsedData.data.password, 5)

        const user = await prismaClient.user.create({
            data: {
                email: parsedData.data?.email,
                password: hashedPassword,
                name: parsedData.data.name
            }
        })
        res.json({
            userId: user.id
        })
    } catch (error) {
        res.status(403).json({
            message: "User already exists",
        })
        errorThrown = true;
    }

    if(!errorThrown) {
        res.json({
            messgage: "You are signed up"
        })
    }
})

app.post("/signin", async (req, res) => {
    const parsedData = SigninSchema.safeParse(req.body);
    if(!parsedData.success) {
        res.json({
            message: "Incorrect Format"
        })
        return
    }

   const response = await prismaClient.user.findFirst({
        where: {
            email: parsedData.data.email, 
        }
    })

    const { password } = parsedData.data

    if(!response) {
        res.status(403).json({
            message: "User does not exist"
        })
        return
    }

    const passwordMatch = await bcrypt.compare(password , parsedData.data.password);

    if(passwordMatch) {
        const token = jwt.sign({
            userId: response?.id.toString()
        }, JWT_SECRET )
        res.json({
            token: token
        })
    } else {
        res.status(403).json({
            message: "Incorrect Credentials"
        })
    }
})

app.post("/room", middleware, async (req, res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if(!parsedData.success) {
        res.json({
            message: "Incorrect Format"
        })
        return
    }

    const userId = req.userId || ""

    try {
        const room = await prismaClient.room.create({
        data: {
            slug: parsedData.data.roomname,
            adminId: userId 
        }
      })
    
      res.json({
          roomId: room.id
      })
    } catch (error) {
        res.status(411).json({
            message: "Room already exists"
        })
    }
    
})

app.listen(3001)