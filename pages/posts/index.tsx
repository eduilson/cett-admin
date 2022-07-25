import React from 'react'
import dayjs from "dayjs";

import Link from 'next/link'

import {
  Button,
  Table,
  Space,
  Popconfirm, notification, Badge, TablePaginationConfig
} from 'antd'

import {PlusOutlined} from '@ant-design/icons'

import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";
import {Post, User} from "@/types";
import {ColumnsType} from "antd/lib/table";

const routes = [
  {
    link: '/',
    label: 'Início',
  },
  {
    label: 'Posts',
  }
];

type Props = {
  user: User
}

const Index = ({ user }: Props) => {

  const globalContext = React.useContext(GlobalContext)

  const [loading, setLoading] = React.useState(false)
  const [data, setData] = React.useState<Post[]>([])
  const [pagination, setPagination] = React.useState({})

  React.useEffect(() => {
    globalContext.user.set(user)
    fetchData({current: 1, pageSize: 15})
  }, [])

  const fetchData = async (pagination: TablePaginationConfig, filters = {}) => {
    setLoading(true)
    try{
      const url = `admin/posts?page=${pagination.current || 1}&per_page=${pagination.pageSize}&${filters}`
      const { data, total, perPage, page } = (await Request(user.jwt.access_token).get(url)).data
      setData(data.map((row: any) => ({...row, key: row.id})))
      setPagination({current: page, pageSize: perPage, total})
    }catch (err){}
    setLoading(false)
  }

  const destroy = async (id: number) => {
    setLoading(true)
    try{
      await Request(user.jwt.access_token).delete(`admin/posts/${id}`);
      setData(data.filter((i) => i.id !== id))
      notification['success']({
        message: 'Registro removido com sucesso.'
      })
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
      <Link href={`/posts/${id}`} key='edit' passHref>
        <Button>Editar</Button>
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
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
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
        title="Posts"
        extra={[
          <Link href='/posts/add' key='add' passHref>
            <Button icon={<PlusOutlined />} type='primary'>Novo post</Button>
          </Link>
        ]}
      />

      <Table
        pagination={pagination}
        loading={loading}
        columns={columns}
        dataSource={data}
        onChange={fetchData}
        scroll={{x: 1300}} />
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
