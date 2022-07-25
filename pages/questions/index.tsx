import React from 'react'
import Link from 'next/link'

import {
  Button,
  Table,
  Space,
  Popconfirm, notification, TablePaginationConfig
} from 'antd'

import {
  PlusOutlined,
  ProfileFilled
} from '@ant-design/icons'

import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import parseFilters from "@/utils/parseFilters";
import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";

import {
  Question,
  QuestionTopic,
  User
} from "@/types";
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
  }
];

type Props = {
  user: User
}

const Index = ({ user }: Props) => {

  const globalContext = React.useContext(GlobalContext)

  const [loading, setLoading] = React.useState(true)
  const [rows, setRows] = React.useState<Question[]>([])
  const [question_topics, setQuestionTopics] = React.useState<QuestionTopic[]>([])
  const [pagination, setPagination] = React.useState({})

  React.useEffect(() => {
    globalContext.user.set(user)
    getQuestionTopics()
    fetchData({current: 1, pageSize: 15})
  }, [])

  const getQuestionTopics = async () => {
    try{
      const response = (await Request(user.jwt.access_token).get('admin/question-topics?perPage=999')).data
      setQuestionTopics(response.data)
    }catch (err){}
  }

  const fetchData = async (pagination: TablePaginationConfig, filters = {}) => {
    setLoading(true)
    filters = parseFilters(filters)
    try{
      const url = `admin/questions?page=${pagination.current}&per_page=${pagination.pageSize}&${filters}`
      const { data, total, perPage, page } = (await Request(user.jwt.access_token).get(url)).data
      setRows(data.map((row: any) => ({...row, key: row.id})))
      setPagination({current: page, pageSize: perPage, total})
    }catch (err){}
    setLoading(false)
  }


  const remove = async (id: number) => {
    setLoading(true)

    try{
      await Request(user.jwt.access_token).delete(`/admin/questions/${id}`)
      notification['success']({
        message: 'Questão excluída com sucesso.'
      })
      setRows(rows.filter(i => i.id !== id))
    }catch (err){
      notification['error']({
        message: 'Não foi possível excluir a questão. Por favor, tente novamente'
      })
    }

    setLoading(false)
  }

  const TextColumn = (text: string) => (
    <span dangerouslySetInnerHTML={{
      __html: text.replace(/<[^>]*>?/gm, '').substring(0, 50) + "..."
    }} />
  )

  const ActionsColumn = (id: number) => (
    <Space size='middle'>
      <Link href={`/questions/${id}`} key='edit'>
        <a className='ant-btn'>Editar</a>
      </Link>
      <Popconfirm
        key='delete'
        placement='bottomRight'
        title="Têm certeza que deseja remover essa questão?"
        okText="Sim"
        onConfirm={() => remove(id)}
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
      ...getColumnSearchProps('id'),
    },
    {
      title: 'Texto',
      dataIndex: 'text',
      key: 'text',
      render: TextColumn
    },
    {
      title: 'Tópico',
      dataIndex: 'question_topic',
      key: 'question_topic',
      render: (question_topic: QuestionTopic) => question_topic.name,
      filters: question_topics.map(question_topic => ({text: question_topic.name, value: question_topic.id})),
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
        title="Banco de questões"
        extra={[
          <Link href='/question-topics' key='topics'>
            <a className='ant-btn ant-btn-dashed'>
              <ProfileFilled /> Tópicos
            </a>
          </Link>,
          <Link href='/questions/add' key='add'>
            <a className='ant-btn ant-btn-primary'>
              <PlusOutlined /> Nova questão
            </a>
          </Link>,
        ]}
      />

      <Table
        pagination={pagination}
        loading={loading}
        columns={columns}
        dataSource={rows}
        rowKey="id"
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
