import React from 'react'
import Link from 'next/link'

import {
  Badge,
  Button,
  Table,
  Space,
  Popconfirm,
  notification, TablePaginationConfig
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
import dayjs from "dayjs";

const routes = [
  {
    link: '/',
    label: 'Início',
  },
  {
      label: 'Auto escolas',
  }
];

type Props = {
  user: User
}

const Index = ({ user }: Props) => {

  const globalContext = React.useContext(GlobalContext)

  const [loading, setLoading] = React.useState(false)
  const [data, setData] = React.useState([])
  const [pagination, setPagination] = React.useState({})

  React.useEffect(() => {
    globalContext.user.set(user)
    fetchData({current: 1, pageSize: 15})
  }, [])

  const fetchData = async (pagination: TablePaginationConfig) => {
    setLoading(true)
    try{
      const url = `admin/accounts?page=${pagination.current}&per_page=${pagination.pageSize}`
      const { data, total, per_page, page } = (await Request(user.jwt.access_token).get(url)).data
      setData(data.map((i: any) => ({...i, key: i.id})))
      setPagination({current: page, total, pageSIze: per_page})
    }catch (err){}
    setLoading(false)
  }

  const deleteAccount = async (id: number) => {
    setLoading(true)
    try{
      await Request(user.jwt.access_token).delete(`admin/accounts/${id}`);
      setData(data.filter((i: any) => i.id !== id))
    }catch (err){
      notification['error']({
        message: 'Não foi possível remover o registro. Por favor, tente novamente.'
      })
    }
    setLoading(false)
  }

  const StatusColumn = (status: boolean) => (
    <Badge
      className="site-badge-count-109"
      status={status ? 'success' : 'error'}
      text={status ? 'Ativo' : 'Inativo'} />
  )

  const ActionsColumn = (id: number) => (
    <Space size='middle'>
      <Link href={`/accounts/${id}`} key='edit' passHref>
        <Button>Editar</Button>
      </Link>
      <Popconfirm
        key='delete'
        placement='bottomRight'
        title="Têm certeza que deseja remover esse menu?"
        okText="Sim"
        onConfirm={() => deleteAccount(id)}
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: StatusColumn
    },
    {
      title: 'Criado em',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (created_at: string) => dayjs(created_at).format('DD/MM/YYYY HH:mm:ss')
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
        title="Auto escolas"
        extra={[
          <Link href='/accounts/add' key='add' passHref>
            <Button icon={<PlusOutlined />} type='primary'>Nova escola</Button>
          </Link>
        ]}
      />

      <Table
        pagination={pagination}
        loading={loading}
        columns={columns}
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
