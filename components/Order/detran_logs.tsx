import React from 'react'
import Link from 'next/link'

import {
    Button,
    Table,
    Space,
    TablePaginationConfig, Tag
} from 'antd'

import {
    EyeOutlined
} from '@ant-design/icons'

import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";

import {
    DetranLog,
} from "@/types";
import {ColumnsType} from "antd/lib/table";
import dayjs from "dayjs";


type Props = {
    id: number
}

const DetranLogs = ({ id }: Props) => {

    const globalContext = React.useContext(GlobalContext)
    const user = globalContext.user.get

    const [loading, setLoading] = React.useState(true)
    const [data, setData] = React.useState<DetranLog[]>([])
    const [pagination, setPagination] = React.useState<any>({current: 1, pageSize: 20})

    React.useEffect(() => {

        globalContext.user.set(user)

        fetchData(pagination)
    }, [])

    const fetchData = async (pagination: TablePaginationConfig) => {
        setLoading(true)
        try{
            const url = `admin/detran-logs?page=${pagination.current}&per_page=${pagination.pageSize}&order_id=${id}`
            const { data, total, perPage, page } = (await Request(user.jwt.access_token).get(url)).data
            setData(data.map((row: DetranLog) => ({...row, key: row.id})))
            setPagination({current: page, pageSize: perPage, total})
        }catch (err){}

        setLoading(false)
    }

    const StatusColumn = (status: boolean) => (
        <React.Fragment>
            { status ? (
                <Tag color="#f50">Sucesso</Tag>
            ) : (
                <Tag color="#87d068">Erro</Tag>
            ) }
        </React.Fragment>
    )

    const ActionsColumn = (name: string) => (
        <Space size='middle'>
            <Link href={`/detran-logs/${name}`} key='view' passHref>
                <Button icon={<EyeOutlined />} />
            </Link>
        </Space>
    )

    const columns: ColumnsType<any> = [
        {
            title: 'Rotina',
            key: 'routine',
            dataIndex: 'routine',
        },
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
            render: StatusColumn
        },
        {
            title: 'Data',
            dataIndex: 'created_at',
            key: 'created_at',
            render: created_at => dayjs(created_at).format('DD/MM/YYYY HH:mm:ss')
        },
        {
            title: 'Visualizar',
            key: 'actions',
            dataIndex: 'id',
            align: 'right',
            render: ActionsColumn
        },
    ]

    return (
        <Table
            loading={loading}
            columns={columns}
            dataSource={data}
            pagination={pagination}
            rowKey="id"
            onChange={fetchData} />
    )
}

export default DetranLogs
