import React from 'react'
import Router from 'next/router'

import {
  Button,
  Card,
  Form,
  Input,
  Transfer,
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

const breadcrumb = [
  {label: 'Início', link: '/'},
  {label: 'Funções', link: '/roles'},
  {label: 'Novo registro'}
]

type Props = {
  user: User
}

const Add = ({ user }: Props) => {

  const globalContext = React.useContext(GlobalContext)

  const [loading, setLoading] = React.useState(false)
  const [permissions, setPermissions] = React.useState([])
  const [targetKeys, setTargetKeys] = React.useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);

  React.useEffect(() => {

    globalContext.user.set(user)
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try{
      let permissions = (await Request(user.jwt.access_token).get('admin/permissions'))?.data
      setPermissions(permissions)
    }catch (err){
      console.log(err)
    }
    setLoading(false)
  }

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      await Request(user.jwt.access_token).post('admin/roles', {...values, permissions: targetKeys})
      await Router.push('/roles')
    }catch(err){
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
    </Button>,
    <Button icon={<DeleteOutlined/>} type='primary' danger key='delete'>Deletar</Button>
  ];

  return (
    <Layout breadcrumb={breadcrumb}>
      <Form
        {...layout}
        name="menu-form"
        onFinish={onFinish}
        autoComplete="off">

        <PageHeader
          onBack={() => Router.push('/roles')}
          extra={extra}
          title='Nova função' />

        <Card title="Dados de cadastro" bordered={false} loading={loading}>
          <Form.Item
            label="Nome"
            name="name"
            rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
            <Input size='large'/>
          </Form.Item>
          <Form.Item
            label="Descrição"
            name="description">
            <Input.TextArea size='large'/>
          </Form.Item>
          <Form.Item
            label="Permissões">
            <Transfer
              listStyle={{width: '50%', height: 400, minHeight: '200px'}}
              dataSource={permissions.map((i: any) => ({...i, key: i.id}))}
              titles={['Permissões', 'Permissões do Grupo']}
              targetKeys={targetKeys}
              selectedKeys={selectedKeys}
              onChange={(nextTargetKeys) => {
                setTargetKeys(nextTargetKeys);
              }}
              onSelectChange={(sourceSelectedKeys, targetSelectedKeys) => {
                setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
              }}
              render={item => item.name}
            />
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
