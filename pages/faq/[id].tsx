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
  DeleteOutlined,
} from '@ant-design/icons'

import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
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
  {link: '/faq', label: 'Pergutas frequentes'},
  {label: 'Novo registro'}
]

type Props = {
  user: User,
  id: number,
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
      const faq = (await Request(user.jwt.access_token).get(`admin/faq/${id}`)).data
      form.setFieldsValue(faq)
    }catch (e){}
    setLoading(false)
  }

  const onFinish = async (values: any) => {
    setLoading(true)
    try{
      await Request(user.jwt.access_token).put(`admin/faq/${id}`, values)
      await Router.push('/faq')
    }catch (e){
      const errors = e.response.data?.errors || {}
      const keys = Object.keys(errors)
      notification['error']({
        placement: "topLeft",
        message: keys.length ? errors[keys[0]][0] : "Não foi possível salvar o usuário"
      })
    }
    setLoading(false)
  }

  const destroy = async () => {
    setLoading(true)
    try{
      await Request(user.jwt.access_token).delete(`admin/faq/${id}`)
      await Router.push('/faq')
    }catch (err){
      notification['error']({
        message: 'Não foi possível remover o registro.'
      });
    }
    setLoading(false)
  }

  return (
    <Layout breadcrumb={routes}>
      <Form
        form={form}
        {...layout}
        name="menu-form"
        onFinish={onFinish}
        autoComplete="off">
        <PageHeader
          onBack={() => Router.push('/faq')}
          extra={[
            <Button
              icon={<SaveOutlined/>}
              type='primary'
              key='save'
              htmlType='submit'
              loading={loading}>Salvar
            </Button>,
            <Button icon={<DeleteOutlined/>} type='primary' danger key='delete' onClick={destroy}>Deletar</Button>
          ]}
          title="Editar registro" />

        <Card title="Dados de cadastro" bordered={false} loading={loading}>
          <Form.Item
            label="Pergunta"
            name="question"
            rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
            <Input.TextArea rows={3}/>
          </Form.Item>
          <Form.Item
            label="Resposta"
            name="answer"
            rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
            <Input.TextArea rows={5}/>
          </Form.Item>
          <Form.Item
            label="Status"
            initialValue={1}
            valuePropName='checked'
            name="status">
            <Switch checkedChildren='Ativo' unCheckedChildren='Inativo'/>
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
