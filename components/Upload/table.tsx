import React from "react"
import dayjs from "dayjs";

import {
    ColumnsType
} from "antd/es/table/Table";

import {
    Button,
    Image, Space,
    Table as AntTable,
    TablePaginationConfig,
    Popconfirm
} from "antd"

import {
    DeleteFilled
} from "@ant-design/icons"

import {
    Upload as UploadType
} from "@/types";

import Request from "@/utils/request";
import GlobalContext from "@/utils/globalContext";
import getColumnSearchProps from "@/utils/getColumnSearchProps";

type Props = {
    rows: UploadType[],
    pagination: TablePaginationConfig,
    fetchData: Function,
    loading: boolean,
    onChange?: Function,
    multiple: boolean,
    rowKeyPrefix?: string,
    selected?: string,
}

const Table = (props: Props) => {

    const globalContext = React.useContext(GlobalContext)
    const user = globalContext.user.get

    const [mimeTypes, setMimeTypes] = React.useState([])
    const [loading, setLoading] = React.useState<boolean>(false)

    React.useEffect(() => {

        async function getMimeTypes(){
            try{
                const response = (await Request(user.jwt.access_token).get('admin/mime-types')).data
                setMimeTypes(response)
            }catch (err){}
        }

        getMimeTypes()
    }, [])


    const formatBytes = (bytes: number, decimals = 2): string => {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    const destroy = async (id: number) => {
        setLoading(true)
        try{
            await Request(user.jwt.access_token).delete(`admin/uploads/${id}`)
            props.fetchData(props.pagination)
        }catch (err){}
        setLoading(false)
    }

    const PathColumn = (upload: UploadType) => {
        const url = process.env.NEXT_PUBLIC_STORAGE_URL + upload.path
        return(
            <Image
                alt={upload.name}
                src={upload.mime_type.indexOf('image/') > -1 ? url : 'error'}
                fallback="data:image/png;base64,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"
            />
        )
    }

    const NameColumn = (upload: UploadType) => (
        <a href={process.env.NEXT_PUBLIC_STORAGE_URL + upload.path} target="_blank" rel="noreferrer">{upload.name}</a>
    )

    const ActionsColumn = (upload: UploadType) => {
        return(
            <Space>
                <Popconfirm
                    title="Têm certeza que deseja remover esse arquivo?"
                    onConfirm={() => destroy(upload.id)}
                    okText="Sim"
                    placement="bottomRight"
                    cancelText="Cancelar">
                    <Button type="text" icon={<DeleteFilled />} danger />
                </Popconfirm>
            </Space>
        )
    }

    const rowSelection = {
        selectedRowKeys: props.selected ?
            props.rows.filter(item => item.path === props.selected )
                .map(item => `${props.rowKeyPrefix}-${item.id}`)
            : [],
        onChange: (selectedRowKeys: React.Key[]) => {

            if(props.multiple){

            }else {
                const row = props.rows.filter(row => props.rowKeyPrefix+'-'+row.id === selectedRowKeys[0])[0]
                props.onChange && row ? props.onChange(row.path) : null
            }

        },
    };

    const columns: ColumnsType<any> = [
        {
            key: 'path',
            render: PathColumn
        },
        {
            title: 'Nome',
            key: 'name',
            render: NameColumn,
            ...getColumnSearchProps('name')
        },
        {
            title: 'Tipo',
            dataIndex: 'mime_type',
            key: 'mime_type',
            filters: mimeTypes.map((item: { mime_type: string}) => ({ text: item.mime_type, value: item.mime_type }))
        },
        {
            title: 'Tamanho',
            dataIndex: 'size',
            key: 'size',
            render: formatBytes
        },
        {
            title: 'Criado em',
            dataIndex: 'created_at',
            key: 'created_at',
            ...getColumnSearchProps('created_at', { type: 'date_ranger'}),
            render: date => dayjs(date).format('DD/MM/YYYY HH:mm:ss')
        },
        {
            key: 'actions',
            align: "right",
            render: ActionsColumn
        },
    ];

    return(
        <AntTable
            rowSelection={{
                type: props.multiple ? 'checkbox' : 'radio',
                ...rowSelection,
            }}
            rowKey={record => props.rowKeyPrefix+'-'+record.id}
            tableLayout="fixed"
            sticky
            pagination={props.pagination}
            loading={props.loading || loading}
            columns={columns}
            dataSource={props.rows}
            onChange={(pagination, filters) => props.fetchData(pagination, filters)} />
    )
}

export default Table
