import React from 'react'
import Router from 'next/router'
import Image from "next/image"

import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Button,
  notification
} from 'antd';

const layout = {
  labelCol: {
    offset: 0,
    span: 24,
  },
  wrapperCol: {
    span: 24,
  },
};

import Request from '@/utils/request'

const Login = () => {
  const [loading, setLoading] = React.useState<boolean>(false)

  const onFinish = async (values: any) => {
    setLoading(true)

    try {
      const jwt = (await Request().post("auth/login", values)).data
      await Request(null, "/api/").post("session", {jwt})
      await Router.push('/')
    } catch (err) {
      notification['error']({
        message: 'Usuário não encontrado',
        description: 'Revise seus dados e tente novamente.',
      })
    }

    setLoading(false)
  };

  return (
    <div className='auth'>
      <Row>
        <Col offset={9} lg={6}>
          <Card
            title={
              <div className='auth__header'>
                <Image alt='Transtec' src='/img/logo.png' width={177} height={83} />
                {/*<h2>Acesso restrito</h2>*/}
              </div>}
            bordered={false}>
            <Form
              {...layout}
              name="login-form"
              onFinish={onFinish}>
              <Form.Item
                label="E-mail"
                name="email"
                rules={[{required: true, message: 'Insira seu e-mail!'}]}>
                <Input size='large'/>
              </Form.Item>
              <Form.Item
                label="Senha"
                name="password"
                rules={[{required: true, message: 'Insira sua senha!'}]}>
                <Input.Password size='large'/>
              </Form.Item>
              <Form.Item>
                <Button
                  size='large'
                  type='primary'
                  htmlType="submit"
                  loading={loading}>Acessar</Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Login
