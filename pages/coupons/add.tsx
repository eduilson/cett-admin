import React from 'react'
import Router from "next/router";

import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  notification
} from 'antd'

import {
  SaveOutlined,
} from '@ant-design/icons'

import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import GlobalContext from "@/utils/globalContext";
import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import Request from "@/utils/request";
import {User} from "@/types";

const layout = {
  labelCol: {span: 6},
  wrapperCol: {span: 10},
};

const routes = [
  {
    link: '/',
    label: 'Início',
  },
  {
    label: 'Cupons',
    link: '/coupons',
  },
  {
    label: 'Novo registro',
  }
];

type Props = {
  user: User
}

const Add = ({ user }: Props) => {

  const globalContext = React.useContext(GlobalContext)

  const [loading, setLoading] = React.useState(false)
  const [courses, setCourses] = React.useState([])

  React.useEffect(() => {
    globalContext.user.set(user)

    fetchData()
  }, [])

  const fetchData = async () => {
    try{
      const courses = (await Request(user.jwt.access_token).get('admin/courses?per_page=999')).data
      setCourses(courses.data)
    }catch (err){}
  }

  const onFinish = async (values: any) => {
    setLoading(true)
    try{
      await Request(user.jwt.access_token).post('admin/coupons', values)
      await Router.push('/coupons')
    }catch(err){
      notification['error']({
        message: 'Não foi possível salvar o cupom de desconto'
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
          extra={extra}
          title='Novo registro'/>

        <Card title="Dados de cadastro" bordered={false} loading={loading}>
          <Form.Item
            label="Nome"
            name="name"
            rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
            <Input size='large'/>
          </Form.Item>
          <Form.Item
            label="Código"
            name="code"
            rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
            <Input size='large'/>
          </Form.Item>
          <Form.Item
            label="Cursos"
            help="Deixe em branco para habilitar para todos os cursos"
            name="courses">
            <Select
              mode="multiple"
              allowClear
              options={courses.map(({ id, name }) => ({value: id, label: name}))}
              size='large'/>
          </Form.Item>
          {/*
          <Form.Item
            label="Quantidade"
            help="Quantidade de cupons. Deixe em branco para não limitar."
            name="amount"
            rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
            <InputNumber size='large'/>
          </Form.Item>
          */}
          <Form.Item
            label="Desconto"
            name="discount"
            rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
            <InputNumber size='large'/>
          </Form.Item>
          <Form.Item
            initialValue={true}
            valuePropName='checked'
            label="Em porcentagem?"
            name="in_percentage">
            <Switch />
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
