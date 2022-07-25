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

import Layout from "@/components/Layout"
import PageHeader from "@/components/PageHeader"

import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";
import {CourseCategory, User} from "@/types";
import {ColumnsType} from "antd/lib/table";
import dayjs from "dayjs";

const routes = [
  {
    link: '/',
    label: 'Início',
  },
  {
    label: 'Categorias',
  }
];

type Props = {
  user: User
}

const Index = ({ user }: Props) => {

  const globalContext = React.useContext(GlobalContext)

  const [loading, setLoading] = React.useState(true)
  const [rows, setRows] = React.useState<CourseCategory[]>([])
  const [pagination, setPagination] = React.useState({})

  React.useEffect(() => {
    globalContext.user.set(user)
    fetchData({ current: 1 })
  }, [])

  const fetchData = async (pagination: TablePaginationConfig) => {
    setLoading(true)
    try{
      const url = `admin/course-categories?page=${pagination.current}`
      const {data, total, per_page, current_page} = (await Request(user.jwt.access_token).get(url)).data
      setRows(data.map((row: any) => ({...row, key: row.id})))
      setPagination({current: current_page, pageSize: per_page, total})
    }catch (e){}
    setLoading(false)
  }

  const remove = async (id: number) => {
    setLoading(true)
    try{
      await Request(user.jwt.access_token).delete(`admin/course-categories/${id}`)
      setRows(rows.filter(i => i.id !== id))
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

  const ActionsColumn = (id: number) => (
    <Space size='middle'>
      <Link href={`/course-categories/${id}`} key='edit' passHref>
        <Button>Editar</Button>
      </Link>
      <Popconfirm
        key='delete'
        placement='bottomRight'
        title="Têm certeza que deseja remover esse menu?"
        okText="Sim"
        onConfirm={() => remove(id)}
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
      key: 'name',
      dataIndex: 'name',
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
        title="Categorias"
        extra={[
          <Link href='/course-categories/add' key='add' passHref>
            <Button icon={<PlusOutlined />} type='primary'>Nova categoria</Button>
          </Link>
        ]}
      />

      <Table
        rowKey="id"
        pagination={pagination}
        onChange={fetchData}
        loading={loading}
        columns={columns}
        dataSource={rows}
        scroll={{x: 1300}} />
    </Layout>
  )
}

export const getServerSideProps = withSession(function ({req, res}) {
  const user = getUser(req, res);

  return {
    props: {
      user,
    },
  };
})

export default Index
