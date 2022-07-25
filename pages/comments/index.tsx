import React from 'react'
import Link from 'next/link'

import {
  Button,
  Table,
  Space,
  Popconfirm, notification, TablePaginationConfig
} from 'antd'

import parseFilters from "@/utils/parseFilters";

import Layout from "@/components/Layout"
import PageHeader from "@/components/PageHeader"

import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";
import {Comment, User} from "@/types";
import {ColumnsType} from "antd/lib/table";

const routes = [
  {
    link: '/',
    label: 'Início',
  },
  {
    label: 'Cupons',
  }
];

type Props = {
  user: User
}

const Index = ({ user }: Props) => {

  const globalContext = React.useContext(GlobalContext)

  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<Comment[]>([])
  const [pagination, setPagination] = React.useState({})

  React.useEffect(() => {
    globalContext.user.set(user)
    fetchData({current: 1, pageSize: 15})
  }, [])

  const fetchData = async (pagination: TablePaginationConfig, filters = {}) => {
    setLoading(true)
    try {
      filters = parseFilters(filters)
      const url = `admin/comments?page=${pagination.current}&per_page=${pagination.pageSize}&${filters}`
      const {data, total, per_page, page} = (await Request(user.jwt.access_token).get(url)).data
      setData(data.map((row: any) => ({...row, key: row.id})))
      setPagination({current: page, pageSize: per_page, total})
    }catch (err){}
    setLoading(false)
  }

  const destroy = async (id: number) => {
    setLoading(true)
    try{
      await Request(user.jwt.access_token).delete(`admin/comments/${id}`)
      setData(data.filter(i => i.id !== id))
      notification['success']({
        message: 'Registro removido com sucesso.'
      })
    }catch (err){
      notification['error']({
        message: 'Não foi possível remover o usuário. Por favor, tente novamente.'
      })
    }

    setLoading(false)
  }

  const ActionsColumn = (id: number) => (
    <Space size='middle'>
      <Link href={`/comments/${id}`} key='edit' passHref>
        <Button>Visualizar</Button>
      </Link>
      <Popconfirm
        key='delete'
        placement='bottomRight'
        title="Têm certeza que deseja remover esse registro?"
        okText="Sim"
        onConfirm={() => destroy(id)}
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
      title: 'E-mail',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Enviado em',
      dataIndex: 'created_at',
      key: 'created_at',
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
      <PageHeader title="Mensagens de contato"/>

      <Table
        pagination={pagination}
        loading={loading}
        columns={columns}
        rowKey="id"
        dataSource={data}
        onChange={fetchData}/>
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
