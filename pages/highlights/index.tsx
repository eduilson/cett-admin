import React from 'react'
import Link from 'next/link'

import {
  PlusOutlined
} from '@ant-design/icons'

import {
  Button,
  Table,
  Space,
  Popconfirm,
  notification,
  TablePaginationConfig
} from 'antd'

import Layout from "@/components/Layout"
import PageHeader from "@/components/PageHeader"

import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";
import {Highlight, User} from "@/types";
import {ColumnsType} from "antd/lib/table";

const routes = [
  {
    link: '/',
    label: 'Início',
  },
  {
    label: 'Destaques',
  }
];

type Props = {
  user: User,
}

const Index = ({ user }: Props) => {

  const globalContext = React.useContext(GlobalContext)

  const [loading, setLoading] = React.useState(false)
  const [rows, setRows] = React.useState<Highlight[]>([])
  const [pagination, setPagination] = React.useState({})

  React.useEffect(() => {

    globalContext.user.set(user)

    fetchData({ current: 1, pageSize: 15 })
  }, [])

  const fetchData = async (pagination: TablePaginationConfig) => {
    setLoading(true)
    try{
      const url = `admin/highlights?page=${pagination.current}`
      const {data, total, per_page, current_page} = (await Request(user.jwt.access_token).get(url)).data
      setRows(data.map((row: any) => ({...row, key: row.id})))
      setPagination({current: current_page, pageSize: per_page, total})
    }catch (e){}
    setLoading(false)
  }

  const remove = async (id: number) => {
    setLoading(true)
    try{
      await Request(user.jwt.access_token).delete('admin/highlights/'+id)
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

  const IconColumn = (icon: string) => <img src={process.env.NEXT_PUBLIC_STORAGE_URL + icon} alt='Icon' style={{maxHeight: 100}} />

  const ActionsColumn = (id: number) => (
    <Space size='middle'>
      <Link href={`/highlights/${id}`} key='edit' passHref>
        <Button>Editar</Button>
      </Link>
      <Popconfirm
        key='delete'
        placement='bottomRight'
        title="Têm certeza que deseja remover esse registro?"
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
      title: 'Ícone',
      dataIndex: 'icon',
      key: 'icon',
      render: IconColumn
    },
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Texto',
      dataIndex: 'text',
      key: 'text'
    },
    {
      title: 'Criado em',
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
      <PageHeader
        title="Destaques"
        extra={[
          <Link href='/highlights/add' key='add' passHref>
            <Button icon={<PlusOutlined />} type='primary'>Novo registro</Button>
          </Link>
        ]}
      />

      <Table
        rowKey="id"
        pagination={pagination}
        onChange={fetchData}
        loading={loading}
        columns={columns}
        dataSource={rows}/>
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
