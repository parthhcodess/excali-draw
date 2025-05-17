import express from "express"
import jwt from "jsonwebtoken"
import { z } from "zod"
import bcrypt from "bcrypt"
import { JWT_SECRET } from "@repo/backend-common/config"
import { middleware } from "./middleware";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common/types"

const app = express();

app.post("/signup", async (req, res) => {
    // const requiredbody = z.object({
    //     email: z.string().email(),
    //     password: z.string().min(8)
    // })

    const data = CreateUserSchema.safeParse(req.body);
    if(!data.success) {
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
    
    const { email, password } = req.body;

    let errorThrown = false;
    try {
        const hashedPassword = await bcrypt.hash(password, 5)
    } catch (error) {
        res.status(403).json({
            message: "Incorrect Password",
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
    const data = SigninSchema.safeParse(req.body);
    if(!data.success) {
        res.json({
            message: "Incorrect Format"
        })
        return
    }

//    const response = await UserModel.findOne({
//         email: email
//     })

    if(!response) {
        res.status(403).json({
            message: "User does not exist"
        })
    }

    const passwordMatch = await bcrypt.compare(password, response.password);

    if(passwordMatch) {
        const token = jwt.sign({
            id: response._id.toString()
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
    const data = CreateRoomSchema.safeParse(req.body);
    if(!data.success) {
        res.json({
            message: "Incorrect Format"
        })
        return
    }

    res.json({
        roomId: 123
    })
})

app.listen(3001)