import {NextApiResponse} from "next"
import {Session} from "next-iron-session"
import withSession from "@/utils/session";
import Request from "@/utils/request";

type Request = {
  session: Session,
  body: any
}

export default withSession(async (req: Request, res: NextApiResponse) => {
  req.session.destroy()
  res.send("Logged out");
});
