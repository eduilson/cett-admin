import React from 'react'
import Link from 'next/link'

import {
  Button,
  Table,
  Space,
  TablePaginationConfig
} from 'antd'

import Layout from "@/components/Layout"
import PageHeader from "@/components/PageHeader"

import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";
import parseFilters from "@/utils/parseFilters";

import {
  DetranLog, State,
  User
} from "@/types";
import {ColumnsType} from "antd/lib/table";
import dayjs from "dayjs";
import getColumnSearchProps from "@/utils/getColumnSearchProps";

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
  const [data, setData] = React.useState<DetranLog[]>([])
  const [states, setStates] = React.useState<State[]>([])
  const [pagination, setPagination] = React.useState<any>({current: 1, pageSize: 20})

  React.useEffect(() => {

    globalContext.user.set(user)

    fetchData(pagination)
    getStates()
  }, [])

  const fetchData = async (pagination: TablePaginationConfig, filters = {}) => {
    setLoading(true)
    try{
      filters = parseFilters(filters)
      const url = `admin/detran-logs?page=${pagination.current}&per_page=${pagination.pageSize}&${filters}`
      const { data, total, perPage, page } = (await Request(user.jwt.access_token).get(url)).data
      setData(data.map((row: DetranLog) => ({...row, key: row.id})))
      setPagination({current: page, pageSize: perPage, total})
    }catch (err){}

    setLoading(false)
  }

  const getStates = async () => {
    try{
      const response = (await Request().get('states')).data
      setStates(response)
    }catch (err){}
  }

  const ActionsColumn = (name: string) => (
    <Space size='middle'>
      <Link href={`/detran-logs/${name}`} key='view' passHref>
        <Button>Visualizar</Button>
      </Link>
    </Space>
  )

  const columns: ColumnsType<any> = [
    {
      title: 'Estado',
      key: 'state',
      dataIndex: 'state',
      render: state => state.name,
      filters: states.map(state => ({ text: state.name, value: state.id }))
    },
    {
      title: 'Rotina',
      key: 'routine',
      dataIndex: 'routine',
      filters: [
          {text: 'Consulta', value: 'Consulta' },
          {text: 'Matrícula', value: 'Matrícula' },
          {text: 'Conclusão', value: 'Conclusão' },
          {text: 'Ticket', value: 'Ticket' },
      ],
    },
    {
      title: 'Data',
      dataIndex: 'created_at',
      key: 'created_at',
      render: created_at => dayjs(created_at).format('DD/MM/YYYY HH:mm:ss')
    },
    {
      title: 'Usuário',
      key: 'user',
      dataIndex: 'order',
      ...getColumnSearchProps('user'),
      render: order => order?.user?.name || 'Não informado'
    },
    {
      title: 'Matrícula',
      key: 'order',
      dataIndex: 'order',
      ...getColumnSearchProps('order_id'),
      render: order => order?.id,
    },
    {
      title: 'CPF',
      key: 'cpf',
      dataIndex: 'cpf',
      ...getColumnSearchProps('cpf')
    },
    {
      title: 'Renach',
      key: 'renach',
      dataIndex: 'renach',
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
      <PageHeader title="Integração com Detrans" />

      <Table
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={pagination}
        rowKey="id"
        scroll={{ x: 1300 }}
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
