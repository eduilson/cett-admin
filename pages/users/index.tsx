import React from 'react'
import Link from 'next/link'

import {
    Button,
    Table,
    Space,
    Popconfirm,
    notification, TablePaginationConfig,
} from 'antd'

import {ColumnsType} from "antd/es/table";

import {PlusOutlined} from '@ant-design/icons'

import getColumnSearchProps from "@/utils/getColumnSearchProps";
import parseFilters from "@/utils/parseFilters";

import Layout from "@/components/Layout"
import PageHeader from "@/components/PageHeader"

import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";

import {User, Role} from "@/types";
import dayjs from "dayjs";

const routes = [
    {
        link: '/',
        label: 'Início',
    },
    {
        label: 'Usuários',
    }
];

type Props = {
    user: User
}

const Index = ({user}: Props) => {
    const globalContext = React.useContext(GlobalContext)
    const [loading, setLoading] = React.useState(true)
    const [roles, setRoles] = React.useState<Role[]>([])
    const [rows, setRows] = React.useState<User[]>([])
    const [pagination, setPagination] = React.useState({})

    React.useEffect(() => {
        fetchData(pagination)
        if (null == user.account_id) {
            getRoles()
        }
        globalContext.user.set(user)
    }, [])

    const getRoles = async () => {
        const {data} = (await Request(user.jwt.access_token).get('admin/roles')).data
        setRoles(data)
    }

    const fetchData = async (pagination: TablePaginationConfig, filters = {}) => {
        setLoading(true)
        try {
            filters = parseFilters(filters)
            const url = `admin/users?page=${pagination.current || 1}&${filters}`
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
            await Request(user.jwt.access_token).delete(`/admin/users/${id}`)
            setRows(rows.filter(i => i.id !== id))
            notification['success']({
                message: 'Usuário removido com sucesso.'
            })
        } catch (e) {
            notification['error']({
                message: 'Não foi possível remover o usuário. Por favor, tente novamente.'
            })
        }

        setLoading(false)
    }

    const ActionsColumn = (id: number) => (
        <Space size='middle'>
            <Link href={`/users/${id}`} passHref>
                <Button>Editar</Button>
            </Link>
            <Popconfirm
                placement='bottomRight'
                title="Têm certeza que deseja excluir esse usuário?"
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
            sorter: true,
            ...getColumnSearchProps('id'),
        },
        {
            title: 'Nome',
            dataIndex: 'name',
            key: 'name',
            ...getColumnSearchProps('name'),
        },
        {
            title: 'E-mail',
            dataIndex: 'email',
            key: 'email',
            ...getColumnSearchProps('email'),
        },
        {
            title: 'CPF',
            dataIndex: 'cpf',
            key: 'cpf',
            ...getColumnSearchProps('cpf', {mask: '111.111.111-11'}),
        },
        {
            title: 'Data de cadastro',
            dataIndex: 'created_at',
            key: 'created',
            render: created_at => dayjs(created_at).format('DD/MM/YYYY HH:mm:ss'),
            ...getColumnSearchProps('created', {type: 'date_ranger'}),
        },
        {
            key: 'actions',
            dataIndex: 'id',
            align: 'right',
            render: id => ActionsColumn(id)
        },
    ]

    // @ts-ignore
    if (user.roles.includes(1) || user.roles.includes(8)) {
        columns.splice(4, 0, {
            title: 'Funções',
            dataIndex: 'roles',
            key: 'roles',
            render: (roles: Role[]) => roles.map(role => role.name).join(','),
            filters: roles.map(role => ({text: role.name, value: role.id}))
        })
    }

    return (
        <Layout breadcrumb={routes}>
            <PageHeader
                title="Usuários"
                extra={[
                    <Link href='/users/add' key='add' passHref>
                        <Button icon={<PlusOutlined/>} type='primary'>Novo usuário</Button>
                    </Link>
                ]}/>

            <Table
                pagination={pagination}
                loading={loading}
                columns={columns}
                dataSource={rows}
                onChange={fetchData}
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
