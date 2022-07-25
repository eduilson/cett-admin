import React from 'react'
import Link from 'next/link'

import {
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
import {Course, State, User} from "@/types";
import {ColumnsType} from "antd/lib/table";
import dayjs from "dayjs";
import getColumnSearchProps from "@/utils/getColumnSearchProps";
import parseFilters from "@/utils/parseFilters";

const routes = [
  {
    link: '/',
    label: 'Início',
  },
  {
      label: 'Retorno de matrículas',
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
  const [courses, setCourses] = React.useState<Course[]>([])
  const [states, setStates] = React.useState<State[]>([])

  React.useEffect(() => {
    globalContext.user.set(user)
    getCourses()
    getStates()
    fetchData({current: 1, pageSize: 15})
  }, [])

  const getCourses = async () => {
    try{
      const response  = (await Request(user.jwt.access_token).get('admin/courses?per_page=999')).data
      setCourses(response.data)
    }catch (err){}
  }

  const getStates = async () => {
    try{
      const response  = (await Request(user.jwt.access_token).get('states')).data
      setStates(response)
    }catch (err){}
  }

  const fetchData = async (pagination: TablePaginationConfig, filters = {}) => {
    setLoading(true)
    filters = parseFilters(filters)
    try{
      const url = `admin/sessions?page=${pagination.current}&per_page=${pagination.pageSize}&is_budget=1&${filters}`
      const { data, total, per_page, page } = (await Request(user.jwt.access_token).get(url)).data
      setData(data.map((i: any) => ({...i, key: i.id})))
      setPagination({current: page, total, pageSIze: per_page})
    }catch (err){}
    setLoading(false)
  }

  const destroy = async (id: number) => {
    setLoading(true)
    try{
      await Request(user.jwt.access_token).delete(`/admin/sessions/${id}`);
      setData(data.filter((i: any) => i.id !== id))
    }catch (err){
      notification['error']({
        message: 'Não foi possível remover o registro. Por favor, tente novamente.'
      })
    }
    setLoading(false)
  }

  const ActionsColumn = (id: number) => (
    <Space size='middle'>
      <Link href={`/sessions/${id}`} key='edit' passHref>
        <Button>Visualizar</Button>
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
      title: 'CPF',
      dataIndex: 'cpf',
      ...getColumnSearchProps('cpf'),
      key: 'cpf',
    },
    {
      title: 'Telefone',
      dataIndex: 'telefone',
      key: 'phone',
    },
    {
      title: 'Curso',
      dataIndex: 'course',
      key: 'course',
      filters: courses.map(({id, name}) => ({ text: name, value: id })),
      render: course => course.name
    },
    {
      title: 'Estado',
      dataIndex: 'state',
      key: 'state',
      filters: states.map(({id, name}) => ({ text: name, value: id })),
      render: state => state?.name
    },
    {
      title: 'Visualizado',
      dataIndex: 'visualized',
      key: 'visualized',
      filters: [{ text: 'Visualizado', value: 1 }, { text: 'Não visualizado', value: 0 }],
      render: visualized => visualized ? 'Visualizado' : 'Nâo visualizado'
    },
    {
      title: 'Criado em',
      dataIndex: 'created_at',
      key: 'created_at',
      render: created_at => dayjs(created_at).format('DD/MM/YYYY H:m:s')
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
        title="Orçamentos"
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
