import React from 'react'
import Link from 'next/link'
import dayjs from "dayjs";

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
import {Faq, User} from "@/types";
import {ColumnsType} from "antd/es/table/Table";

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

const Index = ({user}: Props) => {

    const globalContext = React.useContext(GlobalContext)

    const [loading, setLoading] = React.useState(false)
    const [rows, setRows] = React.useState<Faq[]>([])
    const [pagination, setPagination] = React.useState({})

    React.useEffect(() => {
        globalContext.user.set(user)
        fetchData({ current: 1, pageSize: 15 })
    }, [])

    const fetchData = async (pagination: TablePaginationConfig) => {
        setLoading(true)
        try {
            const url = `admin/faq?page=${pagination.current}`
            const {data, total, per_page, current_page} = (await Request(user.jwt.access_token).get(url)).data
            setRows(data.map((row: any) => ({...row, key: row.id})))
            setPagination({current: current_page, pageSize: per_page, total})
        }catch (e){}
        setLoading(false)
    }

    const remove = async (id: number) => {
        setLoading(true)

        try {
            await Request(user.jwt.access_token).delete(`/admin/faq/${id}`)
            notification['success']({
                message: 'Registro removido com sucesso.'
            })
            setRows(rows.filter(i => i.id !== id))
        } catch (err) {
            notification['error']({
                message: 'Não foi possível remover o registro. Por favor, tente novamente.'
            })
        }

        setLoading(false)
    }

    const ActionsColumn = (id: number) => (
        <Space size='middle'>
            <Link href={`/faq/${id}`} key='edit' passHref>
                <Button>Editar</Button>
            </Link>
            <Popconfirm
                key='delete'
                placement='bottomRight'
                title="Têm certeza que deseja remover essa pergunta?"
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
            title: 'Ordem',
            dataIndex: 'sort_order',
            key: 'sort_order',
        },
        {
            title: 'Pergunta',
            dataIndex: 'question',
            key: 'question',
            render: question => question.length > 32 ? question.substr(0, 36) + '...' : question
        },
        {
            title: 'Resposta',
            dataIndex: 'answer',
            key: 'answer',
            render: answer => answer.length > 32 ? answer.substr(0, 36) + '...' : answer
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: status => status ? 'Ativo' : 'Inativo'
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
            render: id => ActionsColumn(id)
        },
    ]

    return (
        <Layout breadcrumb={routes}>
            <PageHeader
                title="Perguntas frequentes"
                extra={[
                    <Link href='/faq/add' key='add' passHref>
                        <Button icon={<PlusOutlined/>} type='primary'>Nova pergunta</Button>
                    </Link>
                ]}
            />

            <Table
                pagination={pagination}
                loading={loading}
                columns={columns}
                rowKey="id"
                onChange={fetchData}
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
