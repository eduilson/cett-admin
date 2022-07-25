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
} from '@ant-design/icons'

import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import Upload from '@/components/Upload'
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
  {link: '/banners', label: 'Banners'},
  {label: 'Novo registro'}
]

type Props = {
  user: User
}

const Add = ({ user }: Props) => {
  const globalContext = React.useContext(GlobalContext)

  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    globalContext.user.set(user)
  }, [])

  const onFinish = async (values: any) => {
    setLoading(true)
    try{
      await Request(user.jwt.access_token).post(`admin/banners`, values)
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
        form={form}
        onFinish={onFinish}
        autoComplete="off">

        <PageHeader
          onBack={() => Router.push('/banners')}
          extra={extra}
          title="Novo registro" />

        <Card title="Dados de cadastro" bordered={false} loading={loading}>

          <Form.Item
            label="Título"
            name="title"
            rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
            <Input size='large'/>
          </Form.Item>
          {/*
          <Form.Item
            initialValue="#ffffff"
            label="Cor do título"
            name="title_color"
            extra="#fff"
            rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
            <Input type="color" style={{width: 32, padding: 0}} />
          </Form.Item>
          <Form.Item
            label="Texto"
            name="content">
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            initialValue="#ffffff"
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
            rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
            <Upload accept="image/*" />
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
            label="Cor do link"
            initialValue="#fff"
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
            <Select>
              <Select.Option value='_self'>na mesma aba</Select.Option>
              <Select.Option value='_blank'>em nova aba</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item initialValue={true} label='Status' name='status' valuePropName='checked'>
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
