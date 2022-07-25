import React from 'react'

import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import Request from "@/utils/request";

const Add = () => {
  return <React.Fragment />
}

export const getServerSideProps = withSession(async function ({req, res}) {
  const user = getUser(req, res);

  try{
    const draft: { id: number } = (await Request(user.jwt.access_token).get('admin/course-draft')).data
    return{
      redirect: {
        permanent: false,
        destination: `/courses/${draft.id}`
      },
      props: {}
    }
  }catch (err){
    console.log(err)

    return{
      notFound: true
    }
  }
})

export default Add
