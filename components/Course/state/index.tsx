import React from 'react'

import {
    Form,
    Button,
    Divider,
    Select,
    Mentions,
    Switch,
    InputNumber,
    Tabs,
    Input,
    Row,
    Col,
    Space,
    Drawer,
    Spin,
} from 'antd'

import Sliders from './sliders'

import Upload from "@/components/Upload"
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
    courseStateId?: number,
}

const State = ({onClose, visible, courseId, courseStateId}: Props) => {

    const globalContext = React.useContext(GlobalContext)
    const user = globalContext.user.get

    const [form] = Form.useForm()
    const [states, setStates] = React.useState([])
    const [loading, setLoading] = React.useState<boolean>(false)

    React.useEffect(() => {
        if (visible) fetchData()
    }, [visible])

    const fetchData = async () => {
        setLoading(true)
        try {
            const states = (await Request().get("states")).data
            setStates(states)
            if(courseStateId){
                const courseSlider = (await Request(user.jwt.access_token).get(`admin/course-states/${courseStateId}`)).data
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
            if (courseStateId) {
                (await Request(user.jwt.access_token).put(`admin/course-states/${courseStateId}`, values)).data
            } else {
                (await Request(user.jwt.access_token).post('admin/course-states', {...values, course_id: courseId})).data
            }
            onClose()
        } catch (err) {console.log(err)}
        setLoading(false)
    }

    return (
        <Drawer
            onClose={onClose}
            title="Estado"
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
                                label='Estado'
                                name="state_id"
                                rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                                <Select size="large" options={states.map(({id, name}) => ({value: id, label: name}))}/>
                            </Form.Item>
                            <Form.Item
                                label='Preço'
                                name="price"
                                rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                                <InputNumber size="large" />
                            </Form.Item>
                            <Form.Item
                                name="image"
                                label='Imagem'
                                extra='Imagem a ser exibida na página do curso'>
                                <Upload accept='image/*'/>
                            </Form.Item>
                            <Form.Item
                                label='Resumo'
                                name="excerpt">
                                <Mentions rows={3}/>
                            </Form.Item>
                            <Form.Item
                                label="Carga horária"
                                name="max_time"
                                extra="Tempo máximo diário de estudo por aluno em horas. Deixe em branco para utilizar o valor padrão do curso">
                                <InputNumber size="large" />
                            </Form.Item>
                            <Form.Item
                                label='Conteúdo'
                                name="content">
                                <Wysiwyg />
                            </Form.Item>
                            <Form.Item
                                label='Status'
                                valuePropName='checked'
                                initialValue={1}
                                name="status">
                                <Switch checkedChildren='Ativo' unCheckedChildren='Inativo'/>
                            </Form.Item>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab='Sliders' key='sliders' forceRender>
                            <Form.Item
                                label='Título'
                                name="slider_title">
                                <Input size='large'/>
                            </Form.Item>
                            <Form.Item
                                label='Subtitulo'
                                name="slider_subtitle">
                                <Input size='large'/>
                            </Form.Item>
                            <Form.Item
                                label='Status'
                                valuePropName='checked'
                                name="enable_slider">
                                <Switch checkedChildren='Ativo' unCheckedChildren='Inativo'/>
                            </Form.Item>
                            <Row>
                                <Col lg={{offset: 4, span: 16}}>
                                    <Divider/>
                                    <Sliders form={form} />
                                </Col>
                            </Row>
                        </Tabs.TabPane>
                    </Tabs>
                </Form>
            </Spin>
        </Drawer>
    )
}

export default State
