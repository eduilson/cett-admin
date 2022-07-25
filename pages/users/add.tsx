import React from 'react'
import Router from 'next/router'

import {
  Button,
  Card,
} from 'antd'

import Layout from "@/components/Layout"


import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";
import User from "@/components/User";
import PageHeader from "@/components/PageHeader";
import {SaveOutlined} from "@ant-design/icons";

const routes = [
  {
    link: '/',
    label: 'Início',
  },
  {
    link: '/users',
    label: 'Usuários',
  },
  {
    label: 'Editar usuário',
  }
];

import {
  User as UsetT
} from "@/types"
import {FormRef} from "@/components/User/form";

type Props = {
  user: UsetT,
}

const Edit = ({ user }: Props) => {
  const globalContext = React.useContext(GlobalContext)

  const formRef = React.useRef<FormRef>()

  React.useEffect(() => {
    globalContext.user.set(user)
  }, [])

  const extra = [
    <Button
        icon={<SaveOutlined/>}
        type='primary'
        onClick={() => {
          formRef.current && formRef.current.submit()
        }}
        key='save'>Salvar</Button>
  ]

  return (
    <Layout breadcrumb={routes}>

      <PageHeader
          onBack={() => Router.push('/users')}
          title='Novo usuário'
          extra={extra}/>

      <Card title="Dados de cadastro">
        <User.Form
            ref={formRef}
            onSave={(user) => Router.push(`/users/${user.id}`)} />
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

export default Edit
