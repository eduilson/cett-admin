import React from 'react'
import Router from 'next/router'

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

import Upload from "@/components/Upload"
import Layout from "@/components/Layout"
import PageHeader from "@/components/PageHeader"

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
  {link: '/highlights', label: 'Destaques'},
  {label: 'Novo registro'}
]

type Props = {
  user: User
}

const Add = ({ user }: Props) => {

  const globalContext = React.useContext(GlobalContext)

  const [form] = Form.useForm()
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    globalContext.user.set(user)
  }, [])

  const onFinish = async (values: any) => {
    setLoading(true)

    try{
      await Request(user.jwt.access_token).post(`admin/highlights`, values)
      await Router.push('/highlights')
    }catch (err){
      notification['error']({
        message: 'Não foi possível salvar o registro.'
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
        form={form}
        {...layout}
        name="menu-form"
        onFinish={onFinish}
        autoComplete="off">

        <PageHeader
          onBack={() => Router.push('/highlights') }
          extra={extra}
          title="Novo registro"/>

        <Card title="Dados de cadastro" bordered={false} loading={loading}>
          <Form.Item
            label="Título"
            name="title"
            rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
            <Input size='large' />
          </Form.Item>
          <Form.Item
            label="Ícone"
            name="icon">
            <Upload accept='image/*' />
          </Form.Item>
          <Form.Item
            label="Texto"
            name="text">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            initialValue={1}
            valuePropName='checked'
            label="Status"
            name="status">
            <Switch checkedChildren='Ativo' unCheckedChildren='Inativo'/>
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
