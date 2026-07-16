import { Request, Response , NextFunction} from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

type AuthRequest = Request & {
  userId?: number;
};

export function middleware(req:AuthRequest,res:Response,next:NextFunction){
    const token = req.headers["authorization"] ?? "";
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if(typeof decoded =="string"){
        return;
    }

    if(decoded){
        req.userId = decoded.userId;
        next();

    }else{
        res.status(403).json({
            message:"unautherized"
        })
    }
 
}