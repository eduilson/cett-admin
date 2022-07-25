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
  DeleteOutlined,
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
  {label: 'Editar registro'}
]

type Props = {
  user: User,
  id: number
}

const Edit = ({ user, id }: Props) => {

  const globalContext = React.useContext(GlobalContext)

  const [form] = Form.useForm()
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {

    globalContext.user.set(user)

    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try{
      const page = (await Request(user.jwt.access_token).get(`admin/pages/${id}`)).data
      form.setFieldsValue(page)
    }catch (err){}
    setLoading(false)
  }

  const onFinish = async (values: any) => {
    setLoading(true)
    try{
      await Request(user.jwt.access_token).put(`admin/pages/${id}`, values)
      await Router.push('/pages');
    }catch (err){
      notification['error']({
        message: 'Não foi possível salvar o registro!'
      });
    }
    setLoading(false)
  }

  const deletePage = async () => {
    setLoading(true)

    try{
      await Request(user.jwt.access_token).delete(`admin/pages/${id}`);
      await Router.push('/pages')
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
    <Button icon={<DeleteOutlined/>} type='primary' danger key='delete' onClick={deletePage}>Deletar</Button>
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
          onBack={() => Router.push('/pages')}
          extra={extra}
          title='Editar página'/>

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
