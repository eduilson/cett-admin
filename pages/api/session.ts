import {NextApiResponse} from "next"
import {Session} from "next-iron-session"
import withSession from "@/utils/session";
import Request from "@/utils/request";
import {Role} from "@/types";

type Request = {
  session: Session,
  body: any
}

export default withSession(async (req: Request, res: NextApiResponse) => {
  const { jwt } = await req.body;

  try {
    const user = (await Request(jwt.access_token).get("auth/me")).data

    /*
    const permissions = user.roles.map((role: any) => {
      return role.permissions.map((permission: any) => permission.name)
    })
    req.session.set("permissions", permissions);
    */

    if(user.roles) {
      user.roles = user.roles.map((role: Role) => role.id)
    }
    delete user.admin_menus
    req.session.set("user", {...user, jwt});
    await req.session.save();
    res.json({status: "ok"});
  }catch (err){
    res.status(500).json({
      err: err
    })
  }
});
