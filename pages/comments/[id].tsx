import React from 'react'
import Router from "next/router";

import {
  Button,
  Card,
  notification,
  Popconfirm,
  Descriptions
} from 'antd'

import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";
import {Comment, User} from "@/types";

const routes = [
  {
    link: '/',
    label: 'Início',
  },
  {
    label: 'Comentários',
    link: '/comments',
  },
  {
    label: 'Visualizar registro',
  }
];

type Props = {
  user: User,
  id: number
}

const Add = ({ user, id }: Props) => {

  const globalContext = React.useContext(GlobalContext)

  const [loading, setLoading] = React.useState(false)
  const [comment, setComment] = React.useState<Comment|null>()

  React.useEffect(() => {
    globalContext.user.set(user)
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const comment = (await Request(user.jwt.access_token).get(`admin/comments/${id}`)).data
      setComment(comment)
    }catch (e){}
    setLoading(false)
  }

  const destroy = async () => {
    setLoading(true)
    try{
      await Request(user.jwt.access_token).delete(`comments/${comment?.id}`)
      notification['success']({
        message: 'Registro removido com sucesso.'
      })
      Router.push('/comments')
    }catch (err){
      notification['error']({
        message: 'Não foi possível remover o regitro.'
      })
    }
    setLoading(false)
  }

  const extra = [
    <Popconfirm
      key='delete'
      placement='bottomRight'
      title="Têm certeza que deseja remover esse registro?"
      okText="Sim"
      onConfirm={destroy}
      cancelText="Não">
      <Button type='primary' danger>Deletar</Button>
    </Popconfirm>,
  ];

  return (
    <Layout breadcrumb={routes}>
        <PageHeader
          title="Comentário"
          onBack={() => Router.push("/comments")}
          extra={extra}/>

        <Card bordered={false} loading={loading}>
          <Descriptions title="Comentário">
            <Descriptions.Item label="Nome">{ comment?.name }</Descriptions.Item>
            <Descriptions.Item label="E-mail">{ comment?.email }</Descriptions.Item>
            <Descriptions.Item label="Telefone">{ comment?.phone }</Descriptions.Item>
            <Descriptions.Item label="Assunto">{ comment?.subject }</Descriptions.Item>
            <Descriptions.Item label="Mensagem" span={2}>{ comment?.content }</Descriptions.Item>
          </Descriptions>
        </Card>
    </Layout>
  )
}

export const getServerSideProps = withSession(async function ({req, res, query}) {
  const user = getUser(req, res);

  return {
    props: {
      user,
      id: query.id
    },
  };
})

export default Add
