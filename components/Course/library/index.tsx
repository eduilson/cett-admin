import React from 'react'

import {
    Form,
    Input,
    Button,
    Space,
    Drawer,
    Spin,
} from 'antd'

import Upload from "@/components/Upload"
import Wysiwyg from "@/components/Wysiwyg"

import Request from "@/utils/request";

import GlobalContext from "@/utils/globalContext";
import {
    Library as LibraryT
} from "@/types";

const layout = {
    labelCol: {span: 4},
    wrapperCol: {span: 16},
};

type Props = {
    onClose: () => void,
    courseId: number,
    libraryId?: number,
    visible: boolean
}

const Library = (props: Props) => {

    const { courseId, libraryId, visible } = props

    const globalContext = React.useContext(GlobalContext)
    const user = globalContext.user.get

    const [form] = Form.useForm()
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        if(visible) fetchData()
    }, [visible])

    const fetchData = async () => {
        setLoading(true)

        try {
            if (libraryId) {
                const library: LibraryT = (await Request(user.jwt.access_token).get(`admin/course-libraries/${libraryId}`)).data
                form.setFieldsValue(library)
            }else{
                form.resetFields()
            }
        }catch (err){}
        setLoading(false)
    }

    const onFinish = async (values: any) => {
        setLoading(true)
        try {
            if (libraryId) {
                (await Request(user.jwt.access_token).put(`admin/course-libraries/${libraryId}`, {...values, course_id: courseId})).data
            } else {
                (await Request(user.jwt.access_token).post('admin/course-libraries', {...values, course_id: courseId})).data
            }
            onClose()
        } catch (err) {}
        setLoading(false)
    }

    const onClose = () => {
        form.resetFields()
        props.onClose()
    }

    return (
        <Drawer
            onClose={onClose}
            title="Módulo"
            visible={visible}
            width="100vw"
            footer={
                <Space style={{width: "100%", justifyContent: "flex-end"}}>
                    <Button type="primary" onClick={() => form.submit()}>Salvar</Button>
                    <Button type="primary" danger onClick={onClose}>Cancelar</Button>
                </Space>
            }>
            <Spin size="large" spinning={loading}>
                <Form
                    form={form}
                    {...layout}
                    onFinish={onFinish}>
                    <Form.Item
                        label='Nome'
                        name="name"
                        rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                        <Input size='large'/>
                    </Form.Item>
                    <Form.Item
                        label='Url'
                        name="url">
                        <Input size='large'/>
                    </Form.Item>
                    <Form.Item
                        label='Descrição'
                        name="text">
                        <Wysiwyg />
                    </Form.Item>
                    <Form.Item
                        label='Imagem'
                        name="image">
                        <Upload accept='image/*' />
                    </Form.Item>
                    <Form.Item
                        label='Arquivo'
                        name="file">
                        <Upload accept='application/pdf' />
                    </Form.Item>
                </Form>
            </Spin>
        </Drawer>
    )
}

export default Library
