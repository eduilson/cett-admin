import React from 'react'
import Link from 'next/link'

import {
  PlusOutlined
} from '@ant-design/icons'

import {
  Button,
  Table,
  Space,
  Popconfirm, notification, TablePaginationConfig
} from 'antd'

import parseFilters from "@/utils/parseFilters";
import getColumnSearchProps from "@/utils/getColumnSearchProps";

import Layout from "@/components/Layout"
import PageHeader from "@/components/PageHeader"

import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";

import {
  Coupon,
  User
} from "@/types";
import {ColumnsType} from "antd/lib/table";
import dayjs from "dayjs";

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

  const [loading, setLoading] = React.useState<boolean>(true)
  const [data, setData] = React.useState<Coupon[]>([])
  const [pagination, setPagination] = React.useState({})

  React.useEffect(() => {
    globalContext.user.set(user)
    fetchData({ current: 1, pageSize: 15 })
  }, [])

  const fetchData = async (pagination: TablePaginationConfig, filters = {}) => {
    setLoading(true)
    filters = parseFilters(filters)
    try{
      const url = `admin/coupons?page=${pagination.current}&per_page=${pagination.pageSize}&${filters}`
      const { data, total, perPage, page } = (await Request(user.jwt.access_token).get(url)).data
      setData(data.map((row: any) => ({...row, key: row.id})))
      setPagination({current: page, pageSize: perPage, total})
    }catch (err){}
    setLoading(false)
  }

  const destroy = async (id: number) => {
    setLoading(true)
    try{
      await Request(user.jwt.access_token).delete(`admin/coupons/${id}`)
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
      <Link href={`/coupons/${id}`} key='edit' passHref>
        <Button>Editar</Button>
      </Link>
      <Popconfirm
        key='delete'
        placement='bottomRight'
        title="Têm certeza que deseja remover esse menu?"
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
      ...getColumnSearchProps('id'),
    },
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Código',
      dataIndex: 'code',
      key: 'code',
      ...getColumnSearchProps('code'),
    },
    {
      title: 'Criado em',
      dataIndex: 'created_at',
      key: 'created_at',
      render: created_at => dayjs(created_at).format('DD/MM/YYYY HH:mm:ss')
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
        title="Cupons de desconto"
        extra={[
          <Link href='/coupons/add' key='add'>
            <Button icon={<PlusOutlined />} type='primary'>Novo cupom</Button>
          </Link>
        ]}
      />

      <Table
        pagination={pagination}
        loading={loading}
        rowKey="id"
        columns={columns}
        dataSource={data}
        onChange={(pagination, filters) => fetchData(pagination, filters)}/>
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
