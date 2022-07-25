import React from 'react'

import {
    Form,
    Input,
    InputNumber,
    Switch,
    Collapse,
    Button,
    Row,
    Col,
    Spin,
    notification,
    Select,
    Drawer,
    Space,
} from 'antd'

const layout = {
    labelCol: {span: 4},
    wrapperCol: {span: 16},
};

import {
    DeleteOutlined,
    PlusOutlined
} from '@ant-design/icons'

import Lesson from './lesson'

import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";

import {
    CourseState,
    Module as ModuleT, QuestionTopic
} from "@/types"

type Props = {
    onClose: () => void,
    courseId: number,
    moduleId?: number,
    visible: boolean
}

const Module = ({onClose, moduleId, visible, courseId}: Props) => {

    const globalContext = React.useContext(GlobalContext)
    const user = globalContext.user.get

    const [form] = Form.useForm()
    const [questionTopics, setQuestionTopics] = React.useState<QuestionTopic[]>([])
    const [courseStates, setCourseStates] = React.useState<CourseState[]>([])
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        if(visible) fetchData()
    }, [visible])

    const fetchData = async () => {
        setLoading(true)

        try {
            if (moduleId) {
                const module: ModuleT = (await Request(user.jwt.access_token).get(`admin/modules/${moduleId}`)).data
                form.setFieldsValue({
                    ...module,
                    question_topics: module.question_topics.map((topic) => topic.id),
                    course_states: module.course_states.map((course_state) => course_state.id),
                })
            }else{
                form.resetFields()
            }

            const question_topics = (await Request(user.jwt.access_token).get('admin/question-topics?per_page=999')).data
            setQuestionTopics(question_topics.data)
            const courseStates = (await Request(user.jwt.access_token).get(`admin/course-states?per_page=999&course_id=${courseId}`)).data
            setCourseStates(courseStates.data)
        }catch (err){
            notification["error"]({
                message: "Não foi possível salvar o módulo."
            })
        }
        setLoading(false)
    }

    const onFinish = async (values: any) => {
        setLoading(true)
        try {
            if (moduleId) {
                (await Request(user.jwt.access_token).put(`admin/modules/${moduleId}`, {...values, course_id: courseId})).data
            } else {
                (await Request(user.jwt.access_token).post('admin/modules', {...values, course_id: courseId})).data
            }
            onClose()
        } catch (err) {}
        setLoading(false)
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
            <Spin spinning={loading}>
                <Form
                    form={form}
                    {...layout}
                    onFinish={onFinish}>
                    <Row>
                        <Col span={12}>
                            {moduleId !== null && (
                                <Form.Item hidden name="id">
                                    <Input/>
                                </Form.Item>
                            )}
                            <Form.Item
                                label="Título"
                                name="title"
                                rules={[{required: true, message: 'Esse campo é obrigatório'}]}>
                                <Input size="large"/>
                            </Form.Item>
                            <Form.Item
                                label="Descrição"
                                name="description">
                                <Input.TextArea/>
                            </Form.Item>
                            <Form.Item
                                label="Questões"
                                extra='Selecione os tópicos'
                                name="question_topics">
                                <Select
                                    mode="multiple"
                                    allowClear
                                    size="large"
                                    options={questionTopics.map(({id, name}) => ({value: id, label: name}))} />
                            </Form.Item>
                            { courseStates.length > 0 && (
                                <Form.Item
                                    label="Estados"
                                    extra='Selecione os estados'
                                    name="course_states">
                                    <Select
                                        mode="multiple"
                                        allowClear
                                        size="large"
                                        options={courseStates.map(({id, state}) => ({value: id, label: state.name}))} />
                                </Form.Item>
                            ) }
                            <Form.Item
                                label="Carga horária"
                                name="value_time"
                                extra='Em horas'>
                                <InputNumber size="large"/>
                            </Form.Item>
                            <Form.Item
                                valuePropName="checked"
                                label="Introdução"
                                name="is_introduction">
                                <Switch />
                            </Form.Item>
                            <Form.Item
                                valuePropName="checked"
                                label="Ativo"
                                name="status">
                                <Switch defaultChecked />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.List name='lessons'>
                                {(fields, {add, remove}) => (
                                    <React.Fragment>
                                        {fields.length > 0 && (
                                            <Collapse>
                                                {fields.map(field => {
                                                    const lesson = form.getFieldValue(['lessons', field.name])
                                                    return (
                                                        <Collapse.Panel
                                                            header={lesson?.name || `Lição #${field.key + 1}`}
                                                            key={field.key}
                                                            extra={<DeleteOutlined
                                                                onClick={() => remove(field.name)}/>}>
                                                            <Lesson form={form} lesson={field}/>
                                                        </Collapse.Panel>
                                                    )
                                                })}
                                            </Collapse>
                                        )}
                                        <Button
                                            icon={<PlusOutlined/>}
                                            style={{marginTop: fields.length > 0 ? 16 : 0}}
                                            size="large"
                                            type="default"
                                            onClick={() => add()}>Nova lição</Button>
                                    </React.Fragment>
                                )}
                            </Form.List>
                        </Col>
                    </Row>
                </Form>
            </Spin>
        </Drawer>
    )
}

export default Module
