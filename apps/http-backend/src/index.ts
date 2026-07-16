import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET }from "@repo/backend-common/config"; 
import {middleware} from "./middleware";
import { createUserSchema , signinSchema , createRoomSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client"

type AuthRequest = Request & {
  userId?: string;
};

const app = express();

app.post("/signup",async (req,res)=>{
    const data = createUserSchema.safeParse(req.body);
    if(!data.success){
        return res.status(400).json({
            message:"Incorrect inputs"
        })
         
    }
    const user = await prismaClient.user.create({
        data:{
            username:data.data.username,
            password:data.data.password,
            name:data.data.name,
            email:"todo@example.com"
        },

    });
    
    res.json({
        userId:user.id,
    });

});
app.post("/signin",async(req,res)=>{
    const data = signinSchema.safeParse(req.body);
    if(!data.success){
        return res.status(400).json({
            message:"incorrect input"
        });
        
    }
    const user = await prismaClient.user.findFirst({
        where:{
            username:data.data.username,
            password:data.data.password,
        },
    });
    if(!user){
        return res.status(403).json({
            message:"user not found"
        });
    }
    const token = jwt.sign({
        userId: user.id
    },JWT_SECRET);
    res.json({
        token
    });

});
app.post("/room",middleware,async(req:AuthRequest,res:Response)=>{
    const data = createRoomSchema.safeParse(req.body);
    if(!data.success){
        return res.status(400).json({
            message:"incorrent input"
        });   
    }
    const userId = req.userId;
    if (!userId) {
    return res.status(403).json({
      message: "user not found",
    });
    }
    const room = await prismaClient.room.create({
        data:{
            name:data.data.name,
            slug:data.data.name.toLowerCase().replace(/\s+/g, "-"),
            adminId:userId,
        }
    })

    res.json({
        roomId:room.id,
    });
     
});

app.listen(3001);