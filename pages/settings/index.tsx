import React from 'react'
import Router from 'next/router'

import {
  Card,
  Tabs,
} from 'antd'

import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'

const routes = [
  {
    link: '/',
    label: 'Início',
  },
  {
    link: '/courses',
    label: 'Cursos',
  },
  {
    label: 'Novo curso',
  }
];

import {
  Instagram,
} from '@/components/Settings'
import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";
import {User} from "@/types";

type Props = {
  user: User
}

const Index = ({ user }: Props) => {

  const globalContext = React.useContext(GlobalContext)

  React.useEffect(() => {
    globalContext.user.set(user)
  }, [])

  return (
    <Layout breadcrumb={routes}>
      <PageHeader
        onBack={() => Router.push('/courses')}
        title='Configurações' />

      <Card title="Geral" bordered={false}>
        <Tabs defaultActiveKey="general" tabPosition='left' tabBarStyle={{width: 170}}>
          <Tabs.TabPane tab="Instagram" key="instagram">
            <Instagram />
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </Layout>
  )
}

export const getServerSideProps = withSession(async function ({req, res}) {
  const user = getUser(req, res);

  return {
    props: {
      user,
    },
  };
})

export default Index
