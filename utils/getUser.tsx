"use strict"
import {Session} from "next-iron-session";
import {NextApiResponse} from "next";
import {User} from "@/types";

type Request = {
    session: Session,
    body: any
}

const getUser = (req: Request, res: NextApiResponse): User => {
    let user = req.session.get("user");

    if (user === undefined) {
        res.setHeader("location", "/login");
        res.statusCode = 302;
        res.end();
    }

    return user
}

export default getUser
