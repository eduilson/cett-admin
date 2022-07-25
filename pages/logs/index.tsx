import React from "react"
import Link from 'next/link'
import withSession from "@/utils/session";
import getUser from "@/utils/getUser";

import Request from "@/utils/request";
import GlobalContext from "@/utils/globalContext";

import {
  Table,
  Space,
  Button,
  Popconfirm, notification
} from "antd"

import Layout from "@/components/Layout";

import {
  User,
  Role
} from "@/types"
import {ColumnsType} from "antd/es/table";
import PageHeader from "@/components/PageHeader";

type Props = {
  user: User,
  roles: Role[]
}

const Index = (props: Props) => {

  const globalContext = React.useContext(GlobalContext)
  const [loading, setLoading] = React.useState<boolean>(false)
  const [rows, setRows] = React.useState<{name: string, size: string}[]>([])

  const { user } = props

  React.useEffect(() => {
    globalContext.user.set(props.user)
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try{
      const response = (await Request(user.jwt?.access_token).get('admin/logs')).data
      setRows(response)
    }catch (err){}
    setLoading(false)
  }

  const clean = async (name: string) => {
    setLoading(true)
    try{
      await Request(user.jwt?.access_token).delete(`admin/logs/${name}`)
      notification['success']({
        message: 'Arquivo de log limpo com sucesso.',
      })
    }catch (err){}
    setLoading(false)
  }

  const ActionsColumn = (name: string) => (
    <Space>
      <Link href={`/logs/${name}`} key='view'>
        <a className="ant-btn ant-btn-primary">Visualizar</a>
      </Link>
      <Popconfirm
        title="Tem certeza de que deseja limpar esse arquivo de log?"
        onConfirm={() => clean(name)}
        okText="Sim"
        placement="bottomRight"
        cancelText="Não">
        <Button type="primary" danger key="destroy">
          <span>Limpar</span>
        </Button>
      </Popconfirm>
    </Space>
  )

  const columns: ColumnsType<any> = [
    {
      title: 'Arquivo',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Tamanho',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: 'Ações',
      key: 'actions',
      align: "right",
      dataIndex: 'name',
      render: ActionsColumn
    },
  ];

  return (
    <Layout>
      <PageHeader title="Logs do sistema" />
      <Table
        loading={loading}
        dataSource={rows}
        columns={columns}
        rowKey="name" />
    </Layout>
  )
}

export default Index

export const getServerSideProps = withSession(async function ({req, res}) {
  const user = await getUser(req, res)

  return {
    props: {
      user
    },
  };
})
