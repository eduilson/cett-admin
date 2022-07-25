import React from 'react'
import Router from "next/router";

import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
  notification,
  Popconfirm
} from 'antd'

import {
  SaveOutlined,
} from '@ant-design/icons'

import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";
import {Course, User} from "@/types";

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
    label: 'Editar registro',
  }
];

type Props = {
  user: User,
  id: number,
}

const Add = ({ user, id }: Props) => {

  const globalContext = React.useContext(GlobalContext)

  const [form] = Form.useForm()
  const [loading, setLoading] = React.useState<boolean>(false)
  const [courses, setCourses] = React.useState<Course[]>([])

  React.useEffect(() => {

    globalContext.user.set(user)

    fetchData()
  }, [])


  const fetchData = async () => {
    setLoading(true)
    try {
      const courses = (await Request(user.jwt.access_token).get('admin/courses?per_page=999')).data
      setCourses(courses.data)
      const coupon = (await Request(user.jwt.access_token).get(`admin/coupons/${id}`)).data
      form.setFieldsValue({
        ...coupon,
        courses: coupon.courses.map((course: Course) => course.id)
      })
    }catch (err){}
    setLoading(false)
  }

  const onFinish = async (values: any) => {
    setLoading(true)
    try{
      await Request(user.jwt.access_token).put(`admin/coupons/${id}`, values)
      await Router.push('/coupons')
    }catch(err){
      notification['error']({
        message: 'Não foi possível salvar o cupom de desconto'
      });
    }
    setLoading(false)
  }

  const destroy = async () => {
    setLoading(true)
    try{
      await Request(user.jwt.access_token).delete(`admin/coupons/${id}`)
      Router.push('/coupons')
    }catch (err){
      notification['error']({
        message: 'Não foi possível remover o regitro.'
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
    <Popconfirm
      key='delete'
      placement='bottomRight'
      title="Têm certeza que deseja remover esse menu?"
      okText="Sim"
      onConfirm={destroy}
      cancelText="Não">
      <Button type='primary' danger>Deletar</Button>
    </Popconfirm>,
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

export const getServerSideProps = withSession(async function ({req, res, query}) {
  const user = getUser(req, res);

  return {
    props: {
      user,
      id: query.id
    },
  };
})

export default Add
