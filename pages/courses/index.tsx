import React from 'react'
import Link from 'next/link'

import {
    Button,
    Table,
    Space,
    Popconfirm,
    notification, TablePaginationConfig
} from 'antd'

import {
    PlusOutlined,
    DragOutlined, UnorderedListOutlined,
} from '@ant-design/icons'

import Layout from "@/components/Layout"
import PageHeader from "@/components/PageHeader"

import parseFilters from "@/utils/parseFilters";
import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";
import {ColumnsType} from "antd/lib/table";

import {
    Course, User
} from "@/types"
import ShowIF from "@/components/ShowIF";

const routes = [
    {
        link: '/',
        label: 'Início',
    },
    {
        label: 'Cursos',
    }
];

type Props = {
    user: User,
}

const Index = ({user}: Props) => {

    const globalContext = React.useContext(GlobalContext)

    const [loading, setLoading] = React.useState(true)
    const [rows, setRows] = React.useState<Course[]>([])
    const [pagination, setPagination] = React.useState({})

    React.useEffect(() => {
        globalContext.user.set(user)
        fetchData(pagination)
    }, [])

    const fetchData = async (pagination: TablePaginationConfig, filters = {}) => {
        setLoading(true)
        filters = parseFilters(filters)
        try {
            const url = `admin/courses?account_only=1&page=${pagination.current || 1}&per_page=${pagination.pageSize || 20}&${filters}`
            const {data, total, per_page, current_page} = (await Request(user.jwt.access_token).get(url)).data
            setRows(data.map((row: any) => ({...row, key: row.id})))
            setPagination({current: current_page, pageSize: per_page, total})
        } catch (err) {
        }
        setLoading(false)
    }

    const remove = async (id: number) => {
        setLoading(true)
        try {
            await Request(user.jwt.access_token).delete(`admin/courses/${id}`)
            setRows(rows.filter((i) => i.id !== id))
            notification['success']({
                message: 'Curso removido com sucesso'
            })
        } catch (err) {
            notification['error']({
                message: 'Não foi possível remover o registro. Por favor, tente novamente.'
            })
        }

        setLoading(false)
    }

    const ActionsColumn = (id: number) => (
        <Space size='middle'>
            <ShowIF permissions={['courses.update']}>
                <Link href={`/courses/${id}`} passHref>
                    <Button>Editar</Button>
                </Link>
            </ShowIF>
            <ShowIF permissions={['courses.destroy']}>
                <Popconfirm
                    placement='bottomRight'
                    title="Têm certeza que deseja excluir esse usuário?"
                    okText="Sim"
                    onConfirm={() => remove(id)}
                    cancelText="Não">
                    <Button type='primary' danger>Deletar</Button>
                </Popconfirm>
            </ShowIF>
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
            key: 'actions',
            dataIndex: 'id',
            align: 'right',
            render: id => ActionsColumn(id)
        },
    ]

    return (
        <Layout
            breadcrumb={routes}>
            <PageHeader
                title="Cursos"
                extra={[
                    <Link href='/courses/sort' key='sort' passHref>
                        <Button icon={<DragOutlined/>} type='default'>Ordernação</Button>
                    </Link>,
                    <ShowIF permissions={['course-categories.store']} key='course-categories'>
                        <Link href='/course-categories' passHref>
                            <Button icon={<UnorderedListOutlined/>}>Categorias</Button>
                        </Link>
                    </ShowIF>,
                    <ShowIF permissions={['courses.update']} key='add'>
                        <Link href='/courses/add' passHref>
                            <Button icon={<PlusOutlined/>} type='primary'>Novo curso</Button>
                        </Link>
                    </ShowIF>
                ]}
            />

            <Table
                loading={loading}
                columns={columns}
                rowKey="id"
                dataSource={rows}
                onChange={(pagination, filters) => fetchData(pagination, filters)}
                scroll={{x: 1300}}
            />
        </Layout>
    )
}

export const getServerSideProps = withSession(async function ({req, res}) {
    const user = await getUser(req, res);

    return {
        props: {
            user,
        },
    };
})

export default Index
