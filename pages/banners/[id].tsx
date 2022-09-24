import React from 'react'
import Router from 'next/router'

import {
  Button,
  Card,
  Form,
  Input,
  Switch,
  Select,
  notification
} from 'antd'

import {
  SaveOutlined,
  DeleteOutlined,
} from '@ant-design/icons'

import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import Upload from '@/components/Upload'
import GlobalContext from "@/utils/globalContext";
import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import Request from "@/utils/request";
import {User} from "@/types";

const layout = {
  labelCol: {span: 4},
  wrapperCol: {span: 16},
};

const routes = [
  {link: '/', label: 'Início'},
  {link: '/banners', label: 'Banners'},
  {label: 'Editar registro'}
]

type Props = {
  user: User,
  id: number
}

const Edit = ({ user, id }: Props) => {
  const globalContext = React.useContext(GlobalContext)
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    globalContext.user.set(user)

    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try{
      const banner = (await Request(user.jwt.access_token).get(`admin/banners/${id}`)).data
      form.setFieldsValue(banner)
    }catch (err){}
    setLoading(false)
  }

  const onFinish = async (values: any) => {
    setLoading(true)
    try{
      await Request(user.jwt.access_token).put(`admin/banners/${id}`, values)
      await Router.push('/banners')
    }catch (e){
      const errors = e.response.data?.errors || {}
      const keys = Object.keys(errors)
      notification['error']({
        message: keys.length ? errors[keys[0]][0] : "Não foi possível salvar o usuário"
      })
    }
    setLoading(false)
  }

  const destroy = async () => {
    setLoading(true)
    try{
      await Request(user.jwt.access_token).delete(`admin/banners/${id}`)
      await Router.push('/banners')
    }catch (err){
      notification['error']({
        message: 'Não foi possível excluir o registro.'
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
    </Button>,
    <Button icon={<DeleteOutlined/>} onClick={destroy} type='primary' danger key='delete'>Deletar</Button>
  ];

  return (
    <Layout breadcrumb={routes}>
      <Form
        {...layout}
        name="menu-form"
        form={form}
        onFinish={onFinish}
        autoComplete="off">

        <PageHeader
          onBack={() => Router.push('/banners')}
          extra={extra}
          title="Editar registro" />

        <Card title="Dados de cadastro" bordered={false} loading={loading}>

          <Form.Item
            label="Título"
            name="title"
            rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
            <Input size="large" />
          </Form.Item>
          {/*
          <Form.Item
            label="Cor do título"
            name="title_color"
            extra="#fff"
            rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
            <Input type="color" style={{width: 32, padding: 0}} />
          </Form.Item>
          <Form.Item
            label="Texto"
            name="content">
            <Input.TextArea rows={4} showCount />
          </Form.Item>
          <Form.Item
            label="Cor do texto"
            name="content_color"
            extra="#fff"
            rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
            <Input type="color" style={{width: 32, padding: 0}} />
          </Form.Item>
          */}
          <Form.Item
            name='image'
            label='Imagem'
            extra='1920x600'>
            <Upload />
          </Form.Item>
          <Form.Item
            label="Link"
            name="link">
            <Input size='large' />
          </Form.Item>
          {/*
          <Form.Item
            label="Texto do link"
            name="link_text">
            <Input size='large' />
          </Form.Item>
          <Form.Item
            initialValue="#000"
            label="Cor do link"
            extra="Cor do texto do link"
            name="link_color">
            <Input type="color" style={{width: 32, padding: 0}} />
          </Form.Item>
          <Form.Item
            initialValue="#fffd38"
            label="Fundo do link"
            name="link_background">
            <Input type="color" style={{width: 32, padding: 0}} />
          </Form.Item>
          */}
          <Form.Item
            label="Abrir link"
            name="target"
            initialValue='_self'>
            <Select size="large">
              <Select.Option value='_self'>na mesma aba</Select.Option>
              <Select.Option value='_blank'>em nova aba</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label='Status' name='status' valuePropName='checked'>
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
