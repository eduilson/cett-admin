import React from 'react'

import {
    Form,
    Button,
    Switch,
    Tabs,
    Space,
    Drawer,
    Spin, Input,
} from 'antd'

import Wysiwyg from "@/components/Wysiwyg"

import Request from "@/utils/request";
import GlobalContext from "@/utils/globalContext";

const layout = {
    labelCol: {span: 4},
    wrapperCol: {span: 16},
};

type Props = {
    onClose: () => void,
    courseId: number,
    visible: boolean,
    contractId?: number,
}

const Contract = ({onClose, visible, courseId, contractId}: Props) => {

    const globalContext = React.useContext(GlobalContext)
    const user = globalContext.user.get

    const [form] = Form.useForm()
    const [loading, setLoading] = React.useState<boolean>(false)

    React.useEffect(() => {
        if (visible) fetchData()
    }, [visible])

    const fetchData = async () => {
        setLoading(true)
        try {
            if(contractId){
                const courseSlider = (await Request(user.jwt.access_token).get(`admin/contracts/${contractId}`)).data
                form.setFieldsValue(courseSlider)
            }else{
                form.resetFields()
            }
        } catch (err) {
            console.log(err)
        }
        setLoading(false)
    }

    const onFinish = async (values: any) => {
        setLoading(true)
        try {
            if(contractId) {
                (await Request(user.jwt.access_token).put(`admin/contracts/${contractId}`, values)).data
            }else{
                (await Request(user.jwt.access_token).post('admin/contracts', {...values, course_id: courseId})).data
            }
            onClose()
        } catch (err) {console.log(err)}
        setLoading(false)
    }

    return (
        <Drawer
            onClose={onClose}
            title="Contrato"
            visible={visible}
            width="100vw"
            footer={
                <Space style={{width: "100%", justifyContent: "flex-end"}}>
                    <Button type="primary" onClick={() => form.submit()}>Salvar</Button>
                    <Button type="primary" danger onClick={onClose}>Cancelar</Button>
                </Space>
            }>
            <Spin spinning={loading}>
                <Form form={form} {...layout} onFinish={onFinish}>
                    <Tabs defaultActiveKey='general'>
                        <Tabs.TabPane tab='Dados de cadastro' key='general' forceRender>
                            <Form.Item
                                label='Título'
                                name="title"
                                rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                                <Input size="large" />
                            </Form.Item>
                            <Form.Item
                                label='Conteúdo'
                                name="text">
                                <Wysiwyg />
                            </Form.Item>
                            <Form.Item
                                label='Texto de aceite'
                                name="confirm_text">
                                <Input.TextArea rows={4} />
                            </Form.Item>
                            <Form.Item
                                label='É obrigatório?'
                                valuePropName='required'
                                extra="Usuário só pode prosseguir para o curso se aceitar"
                                initialValue={1}
                                name="status">
                                <Switch checkedChildren='Ativo' unCheckedChildren='Inativo'/>
                            </Form.Item>
                        </Tabs.TabPane>
                    </Tabs>
                </Form>
            </Spin>
        </Drawer>
    )
}

export default Contract
