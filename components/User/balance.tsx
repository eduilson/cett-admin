import React from 'react'

import {
    Col,
    Row,
    Statistic, Table, TablePaginationConfig
} from 'antd'
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";
import {ColumnsType} from "antd/lib/table";
import dayjs from "dayjs";

type Props = {
    id: number,
}

const Balance = (props: Props) => {

    const { id } = props

    const globalContext = React.useContext(GlobalContext)
    const user = globalContext.user.get

    const [loading, setLoading] = React.useState(false)
    const [tableLoading, setTableLoading] = React.useState(false)
    const [available, setAvailable] = React.useState(0)
    const [transferred, setTransferred] = React.useState(0)
    const [waitingFunds, setWaitingFunds] = React.useState(0)
    const [pagination, setPagination] = React.useState({})
    const [rows, setRows] = React.useState<any[]>([])

    React.useEffect(() => {
        fetchData()
        getRows(pagination)
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try{
            const { balance } = (await Request(user.jwt.access_token).get(`admin/recipients/${id}`)).data
            setAvailable(balance.available.amount / 100)
            setTransferred(balance.transferred.amount / 100)
            setWaitingFunds(balance.waiting_funds.amount / 100)
        }catch (err){}
        setLoading(false)
    }

    const getRows = async (pagination: TablePaginationConfig) => {
        setTableLoading(true)
        try{
            const operations = (await Request(user.jwt.access_token).get(`admin/balance-operations/${id}?page=${pagination.current || 1}`)).data
            setPagination({current: (pagination.current || 1) + 1})
            setRows(operations)
        }catch (err){}
        setTableLoading(false)
    }

    const currency = (value: number) => {
        return (new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}))
            .format(value)
    }

    const columns: ColumnsType<any> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: 'Tipo',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: 'Valor',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount: number) => currency(amount / 100)
        },
        {
            title: 'Criado em',
            dataIndex: 'date_created',
            key: 'date_created',
            render: created_at => dayjs(created_at).format('DD/MM/YYYY HH:mm:ss')
        },
    ]

    return(
        <React.Fragment>
            <Row gutter={16} style={{marginBottom: 36}}>
                <Col span={8}>
                    <Statistic title="Disponível para Saque" value={currency(available)} precision={2} loading={loading} />
                </Col>
                <Col span={8}>
                    <Statistic title="A Receber" value={currency(waitingFunds)} precision={2} loading={loading} />
                </Col>
                <Col span={8}>
                    <Statistic title="Total de Saques" value={currency(transferred)} precision={2} loading={loading} />
                </Col>
            </Row>
            <Table
                bordered
                rowKey="id"
                pagination={pagination}
                onChange={getRows}
                loading={tableLoading}
                columns={columns}
                dataSource={rows} />
        </React.Fragment>
    )
}

Balance.displayName = 'Balance'

export default Balance
