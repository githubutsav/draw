import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware";
import { createUserSchema, signinSchema, createRoomSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";


type AuthRequest = Request & {
    userId?: string;
};

const app = express();
app.use(express.json());

app.post("/signup", async (req, res) => {
    const parsedData = createUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({
            message: "Incorrect inputs"
        });
    }
    //Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(parsedData.data.password,10);
    
    try {
        const user = await prismaClient.user.create({
            data: {
                email: parsedData.data.email,
                password: hashedPassword,
                name: parsedData.data.name,
            },
        });
        res.json({
            userId: user.id,
        });
    } catch (e) {
        res.status(404).json(
            {
                message: "user already exists"
            }
        )
    }

});
app.post("/signin", async (req, res) => {
    const parsedData = signinSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({
            message: "incorrect input"
        });

    }
    const user = await prismaClient.user.findFirst({
        where: {
            email: parsedData.data.email,
        },
    });
    if (!user) {
        return res.status(403).json({
            message: "user not found"
        });
    }
    // Compare the plain text password with the hashed password from the database
    const passwordMatch = await bcrypt.compare(parsedData.data.password,user.password);
    if(!passwordMatch){
        return res.status(403).json({
            message:"invalid password"
        });
    }
    const token = jwt.sign({
        userId: user.id
    }, JWT_SECRET);
    res.json({
        token
    });

});
app.post("/room", middleware, async (req: AuthRequest, res: Response) => {
    const parsedData = createRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({
            message: "incorrent input"
        });
    }
    const userId = req.userId;
    if (!userId) {
        return res.status(403).json({
            message: "user not found",
        });
    }
    const room = await prismaClient.room.create({
        data: {
            slug: parsedData.data.name.toLowerCase().replace(/\s+/g, "-"),
            adminId: userId,
        }
    })

    res.json({
        roomId: room.id,
    });

});

app.listen(3001, () => {
    console.log("HTTP backend server is running on port 3001");
});
