import React from 'react'
import Router from 'next/router'
import MaskedInput from 'antd-mask-input'
import {
  Button,
  Card,
  Form,
  Input,
  Switch,
  notification
} from 'antd'

import {
  SaveOutlined,
} from '@ant-design/icons'

import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import Upload from '@/components/Upload'
import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";
import {User} from "@/types";

const breadcrumb = [
  {
    link: '/',
    label: 'Início',
  },
  {
    link: '/accounts',
    label: 'Auto Escolas',
  },
  {
    label: 'Novo registro',
  }
];

const layout = {
  labelCol: {span: 4},
  wrapperCol: {span: 16},
};

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
      await Request(user.jwt.access_token).post('admin/accounts', values)
      await Router.push('/accounts');
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
    <Layout breadcrumb={breadcrumb}>
      <Form
        {...layout}
        name="menu-form"
        onFinish={onFinish}
        autoComplete="off">

        <PageHeader
          onBack={() => Router.push('/courses')}
          extra={extra}
          title='Nova Auto Escola' />

        <Card title="Dados de cadastro" bordered={false} loading={loading}>
          <Form.Item
            label="Nome"
            name="name"
            rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
            <Input size='large'/>
          </Form.Item>
          <Form.Item
            label="CNPJ"
            name="cnpj">
            <MaskedInput mask='11.111.111/1111-11' />
          </Form.Item>
          <Form.Item
            label="Telefone"
            name="phone">
            <MaskedInput mask='(11) 1 1111-1111' />
          </Form.Item>
          <Form.Item
            label="Website"
            name="website">
            <Input size='large'/>
          </Form.Item>
          <Form.Item
            label="Facebook"
            name="facebook">
            <Input size='large'/>
          </Form.Item>
          <Form.Item
            label="Logo"
            name="logo">
            <Upload accept='image/*' />
          </Form.Item>
          <Form.Item
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

export const getServerSideProps = withSession(async function ({req, res}) {
  const user = getUser(req, res);

  return {
    props: {
      user,
    },
  };
})

export default Add
