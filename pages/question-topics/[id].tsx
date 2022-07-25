import React from 'react'
import Router from 'next/router'

import {
  Button,
  Card,
  Form,
  Input,
  notification, Popconfirm,
} from 'antd'

import {
  SaveOutlined,
  DeleteOutlined,
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

const routes = [
  {link: '/', label: 'Início'},
  {link: '/questions', label: 'Banco de questões'},
  {link: '/question-topics', label: 'Tópicos'},
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
      const questionTopic = (await Request(user.jwt.access_token).get(`admin/question-topics/${id}`)).data
      form.setFieldsValue(questionTopic)
    }catch (err){
      await Router.push('/question-topics')
    }
    setLoading(false)
  }

  const onFinish = async (values: any) => {
    setLoading(true)

    try{
      await Request(user.jwt.access_token).put(`admin/question-topics/${id}`, values)
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

  const remove = async () => {
    setLoading(true)
    try{
      await Request(user.jwt.access_token).delete(`admin/question-topics/${id}`)
      await Router.push('/question-topics')
    }catch (err){
      notification['error']({
        message: 'Não foi possível remover o registro.'
      })
    }
    setLoading(true)
  }

  const extra = [
    <Button
      icon={<SaveOutlined/>}
      type='primary'
      key='save'
      htmlType='submit'
      loading={loading}>Salvar
    </Button>,
    <Popconfirm
      key='delete'
      placement='bottomRight'
      title="Têm certeza que deseja remover esse registro?"
      okText="Sim"
      onConfirm={remove}
      cancelText="Não">
      <Button icon={<DeleteOutlined/>} type='primary' danger key='delete'>Deletar</Button>
    </Popconfirm>
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
          onBack={() => Router.push('/question-topics')}
          extra={extra}
          title='Editar Registro' />

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
