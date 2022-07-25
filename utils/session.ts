import {withIronSession, Handler} from "next-iron-session";

export default function withSession(handler: Handler<any, any>) {
    return withIronSession(handler, {
        password: "sdN3z2LJ4bTDPzq6bPqT868sUbwY3SQJ",
        cookieName: "user",
        cookieOptions: {
            secure: false,
            maxAge: 7 * 24 * 60 * 60, // 7 dias
        },
    });
}
