import React from 'react'

import {
    Table,
    TablePaginationConfig,
    Button,
    Space,
    Popconfirm,
} from 'antd'

import {
    PlusOutlined,
    EditOutlined, DeleteOutlined,
} from '@ant-design/icons'

import Module from './module'
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";

import {
    CourseState,
    Module as ModuleT
} from "@/types"
import parseFilters from "@/utils/parseFilters";
import {ColumnsType} from "antd/lib/table";

type Props = {
    courseId: number,
    courseScopeId: number,
}

const Modules = (props: Props) => {

    const {
        courseId,
        courseScopeId,
    } = props

    const globalContext = React.useContext(GlobalContext)
    const user = globalContext.user.get

    const [loading, setLoading] = React.useState(false);
    const [activeModuleId, setActiveModuleId] = React.useState<number>();
    const [showForm, setShowForm] = React.useState<boolean>(false);
    const [rows, setRows] = React.useState<ModuleT[]>([])
    const [pagination, setPagination] = React.useState({})

    React.useEffect(() => {
        fetchData(pagination, {})
    }, [])

    React.useEffect(() => {
        if(activeModuleId) setShowForm(true)
    }, [activeModuleId])

    React.useEffect(() => {
        if(!showForm) {
            setActiveModuleId(undefined)
            fetchData(pagination, {})
        }
    }, [showForm])

    const fetchData = async (pagination: TablePaginationConfig, filters: {}) => {
        setLoading(true)
        try {
            filters = parseFilters(filters)
            const url = `admin/modules?page=${pagination.current || 1}&course_id=${courseId}&${filters}`
            const {data, total, per_page, current_page} = (await Request(user.jwt.access_token).get(url)).data
            setRows(data.map((row: any) => ({...row, key: row.id})))
            setPagination({current: current_page, pageSize: per_page, total})
        } catch (err) {
        }
        setLoading(false)
    }

    const destroy = async (id: number) => {
        setLoading(true)
        try{
            await Request(user.jwt.access_token).delete(`admin/modules/${id}`)
            setRows(rows.filter(row => row.id !== id))
        }catch (err){}
        setLoading(false)
    }
    
    const ActionsColumn = (module: ModuleT) => (
        <Space>
            <Button
                size="small"
                icon={<EditOutlined />}
                type="primary"
                onClick={() => setActiveModuleId(module.id)} />

            <Popconfirm
                placement="bottomRight"
                okText="Excluir"
                cancelText="Cancelar"
                title="Têm certeza que deseja excluir permanentemente esse módulo?"
                onConfirm={() => destroy(module.id)}>
                <Button size="small" icon={<DeleteOutlined />} type="primary" danger />
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
            title: 'Título',
            dataIndex: 'title',
            key: 'title',
        },
        {
            key: 'actions',
            align: "right",
            render: ActionsColumn
        },
    ]

    if (courseScopeId !== 3) {
        columns.splice(1, 0, {
            title: 'Estado(s)',
            dataIndex: 'course_states',
            key: 'course_states',
            render: (course_states: CourseState[]) => {
                return course_states.map(course_state => course_state.state.abbreviation).join(', ')
            }
        })
    }

    return (
        <React.Fragment>
            <Module
                onClose={() => setShowForm(false)}
                moduleId={activeModuleId}
                courseId={courseId}
                visible={showForm} />

            <Table
                size="small"
                bordered
                rowKey="id"
                pagination={pagination}
                loading={loading}
                columns={columns}
                dataSource={rows}
                onChange={fetchData}
            />

            <Space style={{width: "100%", justifyContent: "flex-end", marginTop: 16}}>
                <Button
                    onClick={() => setShowForm(true)}
                    danger type="text"
                    icon={<PlusOutlined />}>Novo módulo</Button>
            </Space>
        </React.Fragment>
    )
}

export default Modules
