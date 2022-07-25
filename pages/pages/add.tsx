import React from 'react'
import Router from 'next/router'
import {
  Button,
  Card,
  Form,
  Input,
  Switch,
  notification,
} from 'antd'

import {
  SaveOutlined,
} from '@ant-design/icons'

import Upload from "@/components/Upload"
import Wysiwyg from "@/components/Wysiwyg"
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

const routes = [
  {link: '/', label: 'Início'},
  {link: '/pages', label: 'Páginas'},
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
      await Request(user.jwt.access_token).post(`admin/pages`, values)
      await Router.push('/pages');
    }catch (err){
      notification['error']({
        message: 'Não foi possível salvar o registro!'
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
    <Layout breadcrumb={routes}>
      <Form
        {...layout}
        name="menu-form"
        onFinish={onFinish}
        autoComplete="off">

        <PageHeader
          onBack={() => Router.push('/pages')}
          extra={extra}
          title='Nova página'/>

        <Card title="Dados de cadastro" bordered={false} loading={loading}>
          <Form.Item
            label="Título"
            name="title"
            rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
            <Input size='large'/>
          </Form.Item>
          <Form.Item
            label="Conteúdo"
            name="content">
            <Wysiwyg/>
          </Form.Item>
          <Form.Item
            label="Banner"
            name="banner">
            <Upload accept="image/*" />
          </Form.Item>
          <Form.Item
            initialValue={true}
            valuePropName='checked'
            label="Status"
            name="status">
            <Switch checkedChildren='Ativo' unCheckedChildren='Inativo' />
          </Form.Item>

        </Card>
      </Form>

    </Layout>
  )
}

export const getServerSideProps = withSession(function ({req, res}) {
  const user = getUser(req, res);

  return {
    props: {
      user,
    },
  };
})

export default Add
