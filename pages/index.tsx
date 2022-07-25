import React from 'react'

import Layout from '@/components/Layout'
import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";

import {
  User
} from "@/types"

type Props = {
  user: User
}

const Index = (props: Props) => {
  const globalContext = React.useContext(GlobalContext)

  React.useEffect(() => {
    globalContext.user.set(props.user)
  }, [])

  return (
    <Layout>
      <React.Fragment />
    </Layout>
  )
}

export const getServerSideProps = withSession(async function ({req, res}) {
  const user = await getUser(req, res);

  return {
    props: {
      user,
    },
  };
})

export default Index
