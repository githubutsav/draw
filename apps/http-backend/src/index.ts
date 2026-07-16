import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware";
import { createUserSchema, signinSchema, createRoomSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client"

type AuthRequest = Request & {
    userId?: string;
};

const app = express();

app.post("/signup", async (req, res) => {
    const parsedData = createUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({
            message: "Incorrect inputs"
        })

    }
    try {
        const user = await prismaClient.user.create({
            data: {
                email: parsedData.data.email,
                password: parsedData.data.password,
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
            password: parsedData.data.password,
        },
    });
    if (!user) {
        return res.status(403).json({
            message: "user not found"
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

app.listen(3001);