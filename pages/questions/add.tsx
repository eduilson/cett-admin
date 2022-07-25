import React from 'react'
import Router from 'next/router'

import {
    Button,
    Card,
    Form,
    Input,
    Switch,
    notification,
    Row,
    Col,
    Divider,
    Select,
} from 'antd'

import {
    SaveOutlined,
    DeleteOutlined,
    PlusOutlined
} from '@ant-design/icons'

import Wysiwyg from "@/components/Wysiwyg"
import PageHeader from "@/components/PageHeader"
import Layout from "@/components/Layout"

import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";
import withSession from "@/utils/session";
import getUser from "@/utils/getUser";

import {
    QuestionTopic,
    User
} from "@/types";

const layout = {
    labelCol: {span: 4},
    wrapperCol: {span: 16},
};

const breadcrumbs = [
    {link: '/', label: 'Início'},
    {link: '/questions', label: 'Banco de questões'},
    {label: 'Novo registro'}
]

type Props = {
    user: User
}

const Add = ({user}: Props) => {

    const globalContext = React.useContext(GlobalContext)

    const [loading, setLoading] = React.useState<boolean>(false)
    const [questionTopics, setQuestionTopics] = React.useState<QuestionTopic[]>([])

    React.useEffect(() => {

        globalContext.user.set(user)

        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const {data} = (await Request(user.jwt.access_token).get('admin/question-topics?per_page=9999')).data
            setQuestionTopics(data)
        } catch (err) {}
        setLoading(false)
    }

    const onFinish = async (values: any) => {
        setLoading(true)
        try {
            (await Request(user.jwt.access_token).post('admin/questions', values)).data
            await Router.push('/questions');
        } catch (err) {
            notification['error']({
                message: 'Não foi possível salvar o registro.'
            });
        }
        setLoading(false)
    }

    const extra = [
        <Button
            icon={<SaveOutlined/>}
            type='primary'
            key='save'
            htmlType='submit'
            loading={loading}>Salvar
        </Button>
    ];

    return (
        <Layout breadcrumb={breadcrumbs}>
            <Form
                {...layout}
                name="menu-form"
                onFinish={onFinish}
                autoComplete="off">

                <PageHeader
                    onBack={() => Router.push('/questions')}
                    extra={extra}
                    title='Nova Questão'/>

                <Card title="Dados de cadastro" bordered={false} loading={loading}>
                    <Form.Item
                        label="Tópico"
                        name="question_topic_id"
                        rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                        <Select
                            size="large"
                            showSearch
                            options={questionTopics.map(({id, name}) => ({value: id, label: name}))}
                            filterOption={(input, option: any) => {
                                return option ? option.label.toLowerCase().indexOf(input.toLowerCase()) > -1 : false
                            }}/>
                    </Form.Item>
                    <Form.Item
                        label="Texto"
                        name="text"
                        rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                        <Wysiwyg/>
                    </Form.Item>
                    <Form.Item
                        label="Feedback"
                        name="feedback"
                        extra='Texto a ser exibido caso o aluno erre a questão'>
                        <Input.TextArea rows={4} showCount />
                    </Form.Item>

                    <Row>
                        <Col offset={4} lg={16}>
                            <Divider orientation="left">Alternativas</Divider>
                            <Form.List name='options'>
                                {(fields, {add, remove}) => (
                                    <React.Fragment>
                                        {fields.map((field, index) => (
                                            <div key={index}>
                                                <Form.Item
                                                    label='Resposta'
                                                    name={[field.name, 'answer']}
                                                    fieldKey={[field.fieldKey, 'answer']}
                                                    rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                                                    <Input.TextArea cols={3}/>
                                                </Form.Item>
                                                <Form.Item
                                                    initialValue={false}
                                                    valuePropName='checked'
                                                    label='Correta'
                                                    name={[field.name, 'is_right']}
                                                    fieldKey={[field.fieldKey, 'is_right']}>
                                                    <Switch checkedChildren='Sim' unCheckedChildren='Não'/>
                                                </Form.Item>
                                                <Form.Item wrapperCol={{offset: 4}}>
                                                    <Button
                                                        onClick={() => remove(field.name)}
                                                        icon={<DeleteOutlined/>}> Remover</Button>
                                                </Form.Item>
                                                {(index + 1) < fields.length && <Divider/>}
                                            </div>
                                        ))}

                                        {fields.length > 0 && <Divider/>}
                                        <Button
                                            onClick={() => add()}
                                            icon={<PlusOutlined/>}>Adicionar alternativa</Button>
                                    </React.Fragment>
                                )}
                            </Form.List>
                        </Col>
                    </Row>
                </Card>
            </Form>
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

export default Add
