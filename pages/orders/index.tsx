import React from 'react'
import dayjs from "dayjs";
import Link from 'next/link'

import {
    Button,
    Table,
    Space,
    Popconfirm,
    notification,
    TablePaginationConfig
} from 'antd'

import {DownloadOutlined, PlusOutlined} from '@ant-design/icons'

import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import parseFilters from "@/utils/parseFilters";
import getColumnSearchProps from "@/utils/getColumnSearchProps";
import getUser from "@/utils/getUser";
import withSession from "@/utils/session";
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";

import {
    User,
    Order,
    Course,
    OrderStatus,
    Account
} from "@/types"
import {ColumnsType} from "antd/lib/table";

const routes = [
    {
        link: '/',
        label: 'Início',
    },
    {
        label: 'Matrículas',
    }
];

const payment_methods = [
    {text: 'Manual', value: 'manual'},
    {text: 'Boleto', value: 'boleto'},
    {text: 'Cartão de crédito', value: 'card'},
    {text: 'Cartão de crédito', value: 'credit_card'},
    {text: 'Débito', value: 'debit'},
    {text: 'Pix', value: 'pix'},
]

type Props = {
    user: User
}

const Index = ({user}: Props) => {

    const globalContext = React.useContext(GlobalContext)

    const [loading, setLoading] = React.useState(true)
    const [data, setData] = React.useState<Order[]>([])
    const [courses, setCourses] = React.useState<Course[]>([])
    const [order_status, setOrderStatus] = React.useState<OrderStatus[]>([])
    const [pagination, setPagination] = React.useState({})
    const [accounts, setAccounts] = React.useState<Account[]>([])
    const [filters, setFilters] = React.useState<string>('')

    React.useEffect(() => {
        globalContext.user.set(user)
        fetchData()
        fetchOrders({current: 1, pageSize: 15})

        // @ts-ignore
        if(!user.account_id || user.roles.indexOf(8) !== 8) {
            getAccounts()
        }
    }, [])

    const getAccounts = async () => {
        try{
            const response = (await Request(user.jwt.access_token).get('admin/accounts?per_page=100')).data
            setAccounts(response.data)
        }catch (err){}
    }

    const fetchData = () => {
        const courses = Request(user.jwt.access_token).get('admin/courses?per_page=999')
        const order_status = Request(user.jwt.access_token).get('admin/order-status')
        Promise
            .all([courses, order_status])
            .then(values => {
                const [courses, order_status] = values
                setOrderStatus(order_status.data)
                setCourses(courses.data.data)
            }).catch(err => {
            console.log(err.response.data)
        })
    }

    const fetchOrders = async (pagination: TablePaginationConfig, filters = {}) => {
        setLoading(true)
        const parsedFilters = parseFilters(filters)
        setFilters(parsedFilters)
        try{
            const url = `admin/orders?page=${pagination.current}&per_page=${pagination.pageSize}&${parsedFilters}`
            const {data, total, per_page, page} = (await Request(user.jwt.access_token).get(url)).data
            setData(data.map((row: Order) => ({...row, key: row.id})))
            setPagination({current: page, pageSize: per_page, total})
        }catch (err){}
        setLoading(false)
    }

    const deleteOrder = async (id: number) => {
        setLoading(true)

        try {
            await Request(user.jwt.access_token).delete(`admin/orders/${id}`);
            setData(data.filter(i => i.id !== id))
            notification['success']({
                message: 'Matrícula excluída com sucesso.'
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
            <Link href={`/orders/${id}`} key='edit' passHref>
                <Button>Editar</Button>
            </Link>
            <Popconfirm
                key='delete'
                placement='bottomRight'
                title="Têm certeza que deseja remover essa matrícula?"
                okText="Sim"
                onConfirm={() => deleteOrder(id)}
                cancelText="Não">
                <Button danger type='primary'>Deletar</Button>
            </Popconfirm>
        </Space>
    )

    const columns: ColumnsType<any> = [
        {
            title: 'ID',
            dataIndex: 'id',
            ...getColumnSearchProps('id'),
            key: 'id',
        },
        {
            title: 'Aluno',
            dataIndex: 'user',
            key: 'user',
            ...getColumnSearchProps('name'),
            render: (user: User) => user.name
        },
        {
            title: 'Cpf',
            dataIndex: 'user',
            key: 'cpf',
            ...getColumnSearchProps('cpf'),
            render: (user: User) => user.cpf
        },
        {
            title: 'Curso',
            dataIndex: 'course',
            key: 'course',
            filters: courses.map(course => ({text: course.name, value: course.id})),
            render: (course: Course) => course.name
        },
        {
            title: 'Valor',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount: number) => (new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'})).format(amount)
        },
        {
            title: 'Método de pagamento',
            dataIndex: 'payment_method',
            filters: payment_methods,
            key: 'payment_method',
            render: (payment_method: string) => {
                if(payment_method) {
                    return payment_methods.filter(pm => pm.value === payment_method)[0].text
                }else return "Manual"
            }
        },
        {
            title: 'Status',
            dataIndex: 'order_status',
            filters: order_status.map(order_status => ({text: order_status.name, value: order_status.id})),
            key: 'order_status',
            render: (order_status: OrderStatus) => order_status.name
        },
        {
            title: 'Criado em',
            dataIndex: 'created_at',
            ...getColumnSearchProps('created', {type: 'date_ranger'}),
            key: 'created_at',
            render: created_at => dayjs(created_at).format('DD/MM/YYYY HH:mm:ss')
        },
        {
            key: 'actions',
            dataIndex: 'id',
            render: ActionsColumn
        },
    ]

    // @ts-ignore
    if(!user.account_id || user.roles.indexOf(8) !== -1){
        columns.splice(3, 0, {
            title: 'CFC',
            key: 'account_id',
            dataIndex: 'user',
            align: 'right',
            render: (user: User) => user.account?.name ?? '',
            filters: accounts.map(account => ({text: account.name, value: account.id}))
        })
    }

    return (
        <Layout breadcrumb={routes}>
            <PageHeader
                title="Matrículas"
                extra={[
                    <Button
                        onClick={() => {
                            window.open( process.env.NEXT_PUBLIC_API_URL + `admin/orders-exports?token=${user.jwt.access_token}&${filters}` )
                        }}
                        key="export"
                        icon={<DownloadOutlined />} type='ghost'>Exportar</Button>,
                    <Link href='/orders/add' key='add' passHref>
                        <Button icon={<PlusOutlined/>} type='primary'>Nova matrícula</Button>
                    </Link>
                ]}/>

            <Table
                loading={loading}
                columns={columns}
                pagination={pagination}
                rowKey="id"
                onChange={fetchOrders}
                dataSource={data}
                scroll={{x: 1300}} />
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
