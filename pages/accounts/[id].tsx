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
  DeleteOutlined,
} from '@ant-design/icons'

import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import Upload from '@/components/Upload'
import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import Request from "@/utils/request";
import {User} from "@/types";

const layout = {
  labelCol: {span: 4},
  wrapperCol: {span: 16},
};

const routes = [
  {
    link: '/',
    label: 'Início',
  },
  {
    label: 'Auto escolas',
    link: '/accounts'
  },
  {
    label: 'Editar registro',
    link: '/accounts'
  },
];

type Props = {
  user: User
  id: number
}

const Edit = ({ user, id }: Props) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try{
      const data = (await Request(user.jwt.access_token).get(`admin/accounts/${id}`)).data
      form.setFieldsValue(data)
    }catch (e){}
    setLoading(false)
  }

  const onFinish = async (values: any) => {
    setLoading(true)
    try{
      await Request(user.jwt.access_token).put(`admin/accounts/${id}`, values)
      await Router.push('/accounts');
    }catch (err){
      notification['error']({
        message: 'Não foi possível salvar o registro!'
      });
    }
    setLoading(false)
  }

  const deleteAccount = async () => {
    setLoading(true)
    try{
      await Request(user.jwt.access_token).delete(`admin/accounts/${id}`);
      await Router.push('/accounts')
    }catch (err){
      notification['error']({
        message: 'Não foi possível remover o registro. Por favor, tente novamente.'
      })
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
    </Button>,
    <Button
      onClick={deleteAccount}
      icon={<DeleteOutlined/>}
      type='primary' danger key='delete'>Deletar</Button>
  ];

  return (
    <Layout
      breadcrumb={routes}>
      <Form
        form={form}
        {...layout}
        name="menu-form"
        onFinish={onFinish}
        autoComplete="off">

        <PageHeader
          extra={extra}
          title='Editar registro'
          onBack={() => Router.push("/accounts")}/>

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

export const getServerSideProps = withSession(async function ({req, res, query}) {
  const user = getUser(req, res);

  return {
    props: {
      user,
      id: query.id
    },
  };
})

export default Edit
