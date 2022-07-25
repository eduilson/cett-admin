import React from 'react'
import Router from 'next/router'

import {
  Button,
  Card,
  Form,
  Input,
  notification,
} from 'antd'

import {
  SaveOutlined,
} from '@ant-design/icons'

import PageHeader from "@/components/PageHeader"
import Layout from "@/components/Layout"

import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";
import {User} from "@/types";

const layout = {
  labelCol: {span: 4},
  wrapperCol: {span: 16},
};

const breadcrumb = [
  {link: '/', label: 'Início'},
  {link: '/questions', label: 'Banco de questões'},
  {link: '/question-topics', label: 'Tópicos'},
  {label: 'Novo registro'}
]

type Props = {
  user: User
}

const Add = ({ user }: Props) => {

  const globalContext = React.useContext(GlobalContext)

  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    globalContext.user.set(user)
  }, [])

  const onFinish = async (values: any) => {
    setLoading(true)

    try{
      await Request(user.jwt.access_token).post('admin/question-topics', values)
      notification['success']({
        message: 'Registro salvo com sucesso.'
      });
      await Router.push('/question-topics');
    }catch (err){
      const errors = err.response.data?.errors || {}
      const keys = Object.keys(errors)
      notification['error']({
        message: keys.length ? errors[keys[0]][0] : 'Não foi possível salvar o registro.'
      });
    }

    setLoading(false)
  }

  const extra = [
    <Button
      icon={<SaveOutlined/>}
      type='primary'
      key='save'
      htmlType='submit'
      loading={loading}>Salvar
    </Button>
  ];

  return (
    <Layout breadcrumb={breadcrumb}>
      <Form
        {...layout}
        name="menu-form"
        onFinish={onFinish}
        autoComplete="off">

        <PageHeader
          onBack={() => Router.push('/question-topics')}
          extra={extra}
          title='Novo Tópico' />

        <Card title="Dados de cadastro" bordered={false} loading={loading}>
          <Form.Item
            label="Nome do tópico"
            name="name"
            rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
            <Input size='large'/>
          </Form.Item>
        </Card>
      </Form>

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

export default Add
