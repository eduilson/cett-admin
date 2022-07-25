import React from 'react'
import Link from 'next/link'

import {
  Button,
  Table,
  Space,
  Popconfirm, notification, TablePaginationConfig
} from 'antd'

import {PlusOutlined} from '@ant-design/icons'

import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";
import {User} from "@/types";
import {ColumnsType} from "antd/lib/table";

const routes = [
  {
    link: '/',
    label: 'Início',
  },
  {
    label: 'Funções',
  }
];

type Props = {
  user: User
}

const Index = ({ user }: Props) => {

  const globalContext = React.useContext(GlobalContext)
  const [loading, setLoading] = React.useState(false)
  const [pagination, setPagination] = React.useState({})
  const [data, setData] = React.useState([])

  React.useEffect(() => {
    globalContext.user.set(user)
    fetchData(pagination)
  }, [])

  const fetchData = async (pagination: TablePaginationConfig) => {
    setLoading(true)
    try{
      const { data, total, per_page, current_page } = (await Request(user.jwt.access_token).get(`admin/roles?page=${pagination.current || 1}`)).data
      setData(data.map((row: any) => ({...row, key: row.id})))
      setPagination({current: current_page, pageSize: per_page, total})
    }catch (e){}
    setLoading(false)
  }

  const deleteRole = async (id: number) => {
    setLoading(true)
    try{
      await Request(user.jwt.access_token).delete(`admin/roles/${id}`)
      setData(data.filter((i: any) => i.id !== id))
      setLoading(false)
      notification['error']({
        message: 'Não foi possível remover o registro. Por favor, tente novamente.'
      })
    }catch (err){}
  }

  const ActionsColumn = (id: number) => (
    <Space size='middle'>
      <Link href={`/roles/${id}`} key='edit' passHref>
        <Button>Editar</Button>
      </Link>
      <Popconfirm
        key='delete'
        placement='bottomRight'
        title="Têm certeza que deseja remover esse registro?"
        okText="Sim"
        onConfirm={() => deleteRole(id)}
        cancelText="Não">
        <Button type='primary' danger>Deletar</Button>
      </Popconfirm>
    </Space>
  )

  const columns: ColumnsType<any> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
    },
    {
      key: 'actions',
      dataIndex: 'id',
      align: 'right',
      render: ActionsColumn
    },
  ]

  return (
    <Layout breadcrumb={routes}>
      <PageHeader
        title="Funções"
        extra={[
          <Link href='/roles/add' key='add' passHref>
            <Button icon={<PlusOutlined/>} type='primary'>Nova função</Button>
          </Link>
        ]}
      />

      <Table
        loading={loading}
        pagination={pagination}
        columns={columns}
        dataSource={data}
        onChange={fetchData} />
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

export default Index
