import React from 'react'
import Router from 'next/router'

import {
    Button,
    Card,
    Form,
    Input,
    Select,
    Row,
    Col,
    Modal,
    Spin,
    Tooltip, notification, Switch
} from 'antd'

import {
    SaveOutlined,
    PlusOutlined, EditOutlined, LinkOutlined
} from '@ant-design/icons'

import PageHeader from "@/components/PageHeader"
import Layout from "@/components/Layout"
import User from "@/components/User"

import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";
import Payment from "@/components/Payment";

import {
    Course, Order,
    OrderStatus,
    User as UserT
} from "@/types";

const layout = {
    labelCol: {span: 4},
    wrapperCol: {span: 16},
};

const routes = [
    {link: '/', label: 'Início'},
    {link: '/orders', label: 'Matrículas'},
    {label: 'Novo registro'}
]

type Props = {
    user: UserT
}

const Add = ({user}: Props) => {

    const globalContext = React.useContext(GlobalContext)

    const [loading, setLoading] = React.useState(false)
    const [users, setUsers] = React.useState<UserT[]>([])
    const [course, setCourse] = React.useState<Course | null>(null)
    const [courses, setCourses] = React.useState<Course[]>([])
    const [order_status, setOrderStatus] = React.useState<OrderStatus[]>([])
    const [showUserForm, setShowUserForm] = React.useState<boolean>(false)
    const [showEditUserForm, setShowEditUserForm] = React.useState<boolean>(false)
    const [selectedUserId, setSelectedUserId] = React.useState<number>()
    const [form] = Form.useForm();

    React.useEffect(() => {
        globalContext.user.set(user)
        fetchData()
        loadUsers('')
    }, [])

    const fetchData = () => {
        setLoading(true)
        const promises = []

        promises.push(Request(user.jwt.access_token).get('admin/order-status'))
        promises.push(Request(user.jwt.access_token).get('admin/courses?per_page=999&contain=course_states.state'))

        Promise
            .all(promises)
            .then(values => {
                const [orderStatus, courses] = values
                setOrderStatus(orderStatus.data)
                setCourses(courses.data.data)
            })
            .catch(err => {
                console.log(err.response.data)
            })
            .then(() => setLoading(false))
    }

    const onFinish = async (values: any) => {
        setLoading(true)

        try {
            let order: Order
            if(user.account_id === null) {
                order = (await Request(user.jwt.access_token).post(`admin/orders`, {
                    ...values,
                    seller_id: user.id
                })).data
            }else{
                order = (await Request().post(`order`, values)).data
            }
            await Router.push(`/orders/${order.id}`)
        } catch (err) {
            const errors = err.response.data?.errors || {}
            const keys = Object.keys(errors)
            Modal.error({
                content: keys.length > 0 ? errors[keys[0]][0] : "Não foi possível concluir a matrícula."
            })
        }

        setLoading(false)
    }

    let timer: any;
    const loadUsers = async (query: string) => {
        clearTimeout(timer);
        timer = setTimeout(async function () {
            const users = (await Request(user.jwt.access_token).get(`/admin/users?roles=3&per_page=999&q=${query}`)).data
            setUsers(users.data)
        }, 500);
    }

    const paymentLink = async () => {
        setLoading(true)
        try{
            const values = form.getFieldsValue()
            const response = (await Request(user.jwt.access_token).post(`admin/sessions`, values)).data
            Modal.info({
                title: 'Link de pagamento',
                content: (
                    <label>
                        <span>Copie o link de pagamento</span>
                        <textarea
                            id="payment-link"
                            className="ant-input"
                            readOnly
                            value={`https://eadcursosdetransito.com.br/checkout/payment?s=${response.session_id}`} />
                    </label>
                ),
                onOk(){
                    const copy = document.getElementById('payment-link');

                    try {
                        // @ts-ignore
                        copy.focus();
                        // @ts-ignore
                        copy.select();
                        document.execCommand('copy');
                        notification['success']({
                            message: 'Copiado!'
                        })
                        setTimeout(() => {
                            Router.push(`/orders`)
                        }, 1000)
                    } catch (err) {
                        alert('Não foi possível copiar.')
                    }
                },
                okText: 'Copiar e fechar'
            })
        }catch (err){
            const errors = err.response.data?.errors || {}
            const keys = Object.keys(errors)
            Modal.error({
                content: keys.length > 0 ? errors[keys[0]][0] : "Não foi possível concluir a matrícula."
            })
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
        </Button>,
        <Button
            icon={<LinkOutlined />}
            key='link'
            onClick={paymentLink}
            loading={loading}>Gerar link de pagamento
        </Button>
    ];

    return (
        <Layout breadcrumb={routes}>
            <Form
                onFieldsChange={() => {
                    let course_id = form.getFieldValue('course_id');
                    let course_state_id = form.getFieldValue('course_state_id');
                    let course = courses.filter(c => c.id === course_id)

                    if (course.length) {
                        setCourse(course[0])
                    }

                    if (course.length && course[0].course_states.length) {

                        let course_state = course[0].course_states.filter(cs => cs.id === course_state_id)
                        if (course_state.length > 0) {
                            form.setFieldsValue({amount: course_state[0].price});
                        }
                    } else {
                        form.setFieldsValue({amount: course_id ? course[0].price : ''});
                    }
                }}
                form={form}
                {...layout}
                name="menu-form"
                onFinish={onFinish}
                autoComplete="off">

                { () => (
                    <React.Fragment>
                        <PageHeader
                            onBack={() => Router.push('/orders')}
                            extra={extra}
                            title='Nova matrícula'/>

                        <User.Modal
                            onSave={(user) => {
                                users.splice(0, 0, user)
                                form.setFieldsValue({ user_id: user.id })
                            }}
                            visible={showUserForm}
                            onClose={() => setShowUserForm(false)} />

                        <User.Modal
                            id={selectedUserId}
                            visible={showEditUserForm}
                            onClose={() => setShowEditUserForm(false)} />

                        <Spin spinning={loading}>
                            <Card
                                title="Dados de cadastro"
                                bordered={false}
                                extra={
                                    <Button
                                        icon={<PlusOutlined />}
                                        onClick={() => setShowUserForm(true)}>
                                        Novo usuário
                                    </Button>
                                }>

                                <Form.Item
                                    label="Usuário"
                                    name="user_id"
                                    extra='Pesquise pelo nome, email ou cpf'
                                    rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                                    <Select
                                        onChange={(value: number) => setSelectedUserId(value)}
                                        showSearch
                                        suffixIcon={
                                            selectedUserId ? (
                                                <Tooltip title="Editar usuário">
                                                    <EditOutlined onClick={() => setShowEditUserForm(true)} />
                                                </Tooltip>
                                            ) : undefined
                                        }
                                        onSearch={loadUsers}
                                        filterOption={() => true}
                                        size='large'
                                        options={users.map(({id, name}) => ({value: id, label: name}))}/>
                                </Form.Item>
                                <Form.Item
                                    label="Curso"
                                    name="course_id"
                                    rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                                    <Select
                                        //defaultActiveFirstOption={false}
                                        size='large'
                                        placeholder='Selecione um curso'
                                        options={courses.map(({ id, name }) => ({ value: id, label: name }))} />
                                </Form.Item>
                                {course && course.course_states.length > 0 && (
                                    <Form.Item
                                        label="Estado"
                                        name="course_state_id"
                                        rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                                        <Select
                                            size='large'
                                            placeholder='Selecione um estado'
                                            options={course.course_states.map(({ id, state }) => ({ value: id, label: state.name }))} />
                                    </Form.Item>
                                )}

                                <Form.Item
                                    label="Valor"
                                    name="amount"
                                    rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                                    <Input disabled size='large'/>
                                </Form.Item>
                                <Form.Item
                                    label="Habilitar certificado"
                                    initialValue={1}
                                    valuePropName='checked'
                                    name="enable_certificate">
                                    <Switch checkedChildren='Ativo' unCheckedChildren='Inativo'/>
                                </Form.Item>

                                <Form.Item
                                    label="Cupom de desconto"
                                    name="coupon_code"
                                    help="Código do cupom">
                                    <Input size='large'/>
                                </Form.Item>

                                {
                                //@ts-ignore
                                !user.roles.includes(1) ? (
                                    <React.Fragment>
                                        <Form.Item initialValue="credit_card" name="payment_method" hidden>
                                            <Input/>
                                        </Form.Item>
                                        <Row>
                                            <Col offset={4} span={16}>
                                                <Payment form={form} />
                                            </Col>
                                        </Row>
                                    </React.Fragment>
                                ) : (
                                    <Form.Item
                                        label="Status"
                                        name="order_status_id"
                                        rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                                        <Select
                                            size='large'
                                            options={order_status.map(({ id, name }) => ({ value: id, label: name }))} />
                                    </Form.Item>
                                )}
                            </Card>
                        </Spin>

                    </React.Fragment>
                ) }
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
