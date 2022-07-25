import React from 'react'
import Router from 'next/router'
import Link from 'next/link'

import {
  Button,
  Table,
  Space,
  Popconfirm, notification, TablePaginationConfig
} from 'antd'

import {
  PlusOutlined,
} from '@ant-design/icons'

import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import parseFilters from "@/utils/parseFilters";
import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";
import {QuestionTopic, User} from "@/types";
import {ColumnsType} from "antd/lib/table";
import getColumnSearchProps from "@/utils/getColumnSearchProps";

const routes = [
  {
    link: '/',
    label: 'Início',
  },
  {
    link: '/questions',
    label: 'Questões',
  },
  {
    label: 'Tópicos',
  }
];

type Props = {
  user: User
}

const Index = ({ user }: Props) => {

  const globalContext = React.useContext(GlobalContext)

  const [loading, setLoading] = React.useState(true)
  const [rows, setRows] = React.useState<QuestionTopic[]>([])
  const [pagination, setPagination] = React.useState({})

  React.useEffect(() => {
    globalContext.user.set(user)
    fetchData({current: 1, pageSize: 15})
  }, [])

  const fetchData = async (pagination: TablePaginationConfig, filters = {}) => {
    setLoading(true)
    try{
      filters = parseFilters(filters)
      const url = `admin/question-topics?page=${pagination.current}&perPage=${pagination.pageSize}&${filters}`
      const { data, total, perPage, page } = (await Request(user.jwt.access_token).get(url)).data
      setRows(data.map((row: any) => ({...row, key: row.id})))
      setPagination({current: page, pageSize: perPage, total})
    }catch (err){}
    setLoading(false)
  }

  const deleteRow = async (id: number) => {
    setLoading(true)
    try{
      await Request(user.jwt.access_token).delete(`/admin/question-topics/${id}`)
      setRows(rows.filter(i => i.id !== id))
      notification['success']({
        message: 'Registro removido com sucesso.'
      })
    }catch (e){
      notification['error']({
        message: 'Não foi possível remover o usuário. Por favor, tente novamente.'
      })
    }
    setLoading(false)
  }

  const ActionsColumn = (id: number) => (
    <Space size='middle'>
      <Link href={`/question-topics/${id}`} key='edit'>
        <a className='ant-btn'>Editar</a>
      </Link>
      <Popconfirm
        key='delete'
        placement='bottomRight'
        title="Têm certeza que deseja remover essa questão?"
        okText="Sim"
        onConfirm={() => deleteRow(id)}
        cancelText="Não">
        <Button danger type='primary'>Deletar</Button>
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
      ...getColumnSearchProps('name')
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
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
        onBack={() => Router.push('/questions')}
        title="Tópicos"
        extra={[
          <Link href='/question-topics/add' key='add'>
            <a className='ant-btn ant-btn-primary' type='primary'>
              <PlusOutlined /> Novo tópico
            </a>
          </Link>,
        ]}
      />

      <Table
          loading={loading}
          columns={columns}
          dataSource={rows}
          rowKey="id"
          pagination={pagination}
          onChange={(pagination, filters) => fetchData(pagination, filters)} />

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
