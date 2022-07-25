import React from 'react'

import {
    Drawer,
    Button,
    Space,
    Upload as AntUpload,
    TablePaginationConfig, List
} from 'antd'

import {
    UploadOutlined,
    DeleteFilled,
    LoadingOutlined,
} from "@ant-design/icons"

import {
    Upload as UploadType
} from "@/types"

import Table from "./table"

import {SizeType} from "antd/es/config-provider/SizeContext";
import Request from "@/utils/request";
import GlobalContext from "@/utils/globalContext";
import {UploadChangeParam} from "antd/es/upload";
import parseFilters from "@/utils/parseFilters";

type Props = {
    size?: SizeType,
    label?: string,
    value?: string,
    modalTitle?: string,
    icon?: JSX.Element,
    onChange?: Function,
    multiple?: boolean,
    id?: string,
    accept?: string,
}

const Upload = (props: Props) => {

    const context = React.useContext(GlobalContext)
    const user = context.user.get

    const {
        label,
        icon,
        size,
        modalTitle,
        onChange,
        value,
        multiple,
        id,
        accept
    } = props

    const [visible, setVisible] = React.useState<boolean>(false)
    const [uploads, setUploads] = React.useState<UploadType[]>([])
    const [loading, setLoading] = React.useState<boolean>(false)
    const [uploading, setUploading] = React.useState<boolean>(false)
    const [pagination, setPagination] = React.useState({})

    React.useEffect(() => {
        if (visible) fetchData(pagination, {})
    }, [visible])

    const fetchData = async (pagination: TablePaginationConfig, filters: Record<string, React.Key[] | null> | null) => {

        setLoading(true)

        let query_filters = filters ? parseFilters(filters) : ''

        if( value ){
            query_filters += `&path=${value}`
        }

        try {
            const response = (await Request(user.jwt.access_token).get(`admin/uploads?page=${pagination.current}&${query_filters}`)).data
            setPagination({
                current: response.current_page,
                pageSize: response.per_page,
                total: response.total
            })
            setUploads(response.data)
        } catch (err) {
        }
        setLoading(false)
    }

    const onOpen = () => {
        setVisible(true)
    }

    const onClose = () => {
        setVisible(false)
    }

    const uploadChange = (info: UploadChangeParam) => {
        const {status} = info.file;
        if (status === 'done') {
            setUploading(false)
            fetchData(pagination, null)
        } else/* if (status === 'error') */{
            setUploading(true)
            //message.error(`${info.file.name} file upload failed.`);
        }
    }

    return (
        <React.Fragment>
            <Space direction="vertical" style={{width: '100%'}}>
                <Button size={size} icon={icon} onClick={onOpen}>
                    {label}
                </Button>
                {value && (
                    <List
                        bordered
                        dataSource={Array.isArray(value) ? value : (value ? [value] : [])}
                        renderItem={value => (
                            <List.Item
                                extra={
                                    <Button
                                        danger
                                        type="text"
                                        icon={<DeleteFilled/>}
                                        onClick={() => onChange ? onChange(null) : void (0)}/>
                                }>
                                {value}
                            </List.Item>
                        )}/>
                )}
            </Space>
            <Drawer
                destroyOnClose
                title={modalTitle}
                placement="right"
                visible={visible}
                onClose={onClose}
                width="100%"
                className="upload"
                footer={
                    <React.Fragment>
                        <AntUpload
                            accept={accept}
                            name="file"
                            showUploadList={false}
                            action={process.env.NEXT_PUBLIC_API_URL + `admin/uploads?token=${user?.jwt.access_token || ''}`}
                            onChange={uploadChange}>
                            <Button
                                size="large"
                                type="link"
                                icon={uploading ? <LoadingOutlined/> : <UploadOutlined/>}>
                                <span>Upload</span>
                            </Button>
                        </AntUpload>
                        <Button
                            disabled={value === null}
                            size="large"
                            onClick={() => setVisible(false)} type="primary">
                            Selecionar
                        </Button>
                    </React.Fragment>
                }>
                <Table
                    rowKeyPrefix={id}
                    pagination={pagination}
                    loading={loading}
                    onChange={onChange}
                    fetchData={fetchData}
                    rows={uploads}
                    selected={value}
                    multiple={multiple || false}/>
            </Drawer>
        </React.Fragment>
    )
}

Upload.defaultProps = {
    icon: <UploadOutlined/>,
    label: "Upload",
    modalTitle: "Uploads",
    size: "large",
    multiple: false,
}

export default Upload
