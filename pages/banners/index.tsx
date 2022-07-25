import React from 'react'
import Link from 'next/link'

import {
  Button,
  Table,
  Space,
  Popconfirm,
  Tag,
  notification, TablePaginationConfig
} from 'antd'

import {
  DragOutlined,
  PlusOutlined
} from '@ant-design/icons'

import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";
import {Banner, User} from "@/types";
import {ColumnsType} from "antd/lib/table";

const routes = [
  {
    link: '/',
    label: 'Início',
  },
  {
    label: 'Banners',
  }
];

type Props = {
  user: User
}

const Index = ({ user }: Props) => {

  const globalContext = React.useContext(GlobalContext)
  const [rows, setRows] = React.useState<Banner[]>([])
  const [loading, setLoading] = React.useState<boolean>(false)
  const [pagination, setPagination] = React.useState({})

  React.useEffect(() => {
    globalContext.user.set(user)

    fetchData({current: 1, pageSize: 15})
  }, [user])

  const fetchData = async (pagination: TablePaginationConfig) => {
    setLoading(true)
    try{
      const url = `admin/banners?page=${pagination.current || 1}`
      const {data, total, per_page, current_page} = (await Request(user.jwt.access_token).get(url)).data
      setRows(data.map((row: any) => ({...row, key: row.id})))
      setPagination({current: current_page, pageSize: per_page, total})
    }catch (err){}
    setLoading(false)
  }

  const destroy = async (id: number) => {
    setLoading(true)
    try{
      await Request(user.jwt.access_token).delete(`admin/banners/${id}`)
      setRows(rows.filter(i => i.id !== id))
    }catch (err){
      notification[ 'error']({
        message: 'Não foi possível remover o Banner!'
      })
    }
    setLoading(false)
  }

  const ImageColumn = (image: string) => (
    <a target='_blank' rel="noopener noreferrer" href={ process.env.NEXT_PUBLIC_STORAGE_URL + image }>
      <img alt="" src={ process.env.NEXT_PUBLIC_STORAGE_URL +image } width={200} />
    </a>
  )

  const TagColumn = (status: boolean) => (
    <Tag color={ status ? 'green' : 'red' }>
      { status ? 'Ativo' : 'Inativo' }
    </Tag>
  )

  const ActionsColumn = (id: number) => (
    <Space size='middle'>
      <Link href={`/banners/${id}`} key='edit' passHref>
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
    },
    {
      title: 'Imagem',
      dataIndex: 'image',
      key: 'image',
      render: ImageColumn
    },
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: TagColumn
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
        title="Banners"
        extra={[
          <Link href='/banners/sort' key='sort' passHref>
            <Button icon={<DragOutlined />} type='default'>Ordernação</Button>
          </Link>,
          <Link href='/banners/add' key='add' passHref>
            <Button icon={<PlusOutlined />} type='primary'>Novo banner</Button>
          </Link>,
        ]} />
      <Table
        rowKey="id"
        pagination={pagination}
        onChange={fetchData}
        loading={loading}
        columns={columns}
        dataSource={rows} />
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
