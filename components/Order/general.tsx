import React from 'react'
import Router from "next/router";
import User from "@/components/User";
import {Button, Col, Divider, Form, FormInstance, Input, Modal, Row, Select, Switch, Tooltip} from "antd";
import {EditOutlined} from "@ant-design/icons";
import {Course, Order, OrderStatus, User as UserT} from "@/types";
import Request from "@/utils/request";


const layout = {
    labelCol: {span: 4},
    wrapperCol: {span: 16},
};

type Props = {
    setLoading: (loading: boolean) => void
    id: number
    form: FormInstance
    user: UserT
    showUserForm: boolean
    setShowUserForm: (showUserForm: boolean) => void
    setShowCertificate?: (showCertificate: boolean) => void
    setOrderSlug?: (orderSlug: string) => void
}

const General = (props: Props) => {

    const {
        setLoading,
        id,
        form,
        user,
        showUserForm,
        setShowUserForm,
        setShowCertificate,
        setOrderSlug,
    } = props

    const [users, setUsers] = React.useState<UserT[]>([])
    const [course, setCourse] = React.useState<Course | null>(null)
    const [courses, setCourses] = React.useState<Course[]>([])
    const [order_status, setOrderStatus] = React.useState<OrderStatus[]>([])
    const [order, setOrder] = React.useState<Order>()
    const [selectedUserId, setSelectedUserId] = React.useState<number>()

    React.useEffect(() => {
        fetchData()
        setUsers([user])
    }, [])

    const fetchData = () => {
        setLoading(true)
        const promises = []

        promises.push(Request(user.jwt.access_token).get('admin/order-status'))
        promises.push(Request(user.jwt.access_token).get('admin/courses?per_page=999&contain=course_states.state'))
        promises.push(Request(user.jwt.access_token).get(`admin/orders/${id}`))

        Promise
            .all(promises)
            .then(values => {
                const [orderStatus, courses, order] = values
                setOrderStatus(orderStatus.data)
                setCourses(courses.data.data)
                form.setFieldsValue(order.data)
                setSelectedUserId(order.data.user_id)
                setOrder(order.data)

                if(setShowCertificate){
                    setShowCertificate(order.data.certificate !== null)
                }

                if(setOrderSlug){
                    setOrderSlug(order.data.slug)
                }

            })
            .catch(err => {
                console.log(err.response.data)
            })
            .then(() => setLoading(false))
    }

    const onFinish = async (values: any) => {
        setLoading(true)
        try {
            await Request(user.jwt.access_token).put(`admin/orders/${id}`, values)
            await Router.push('/orders')
        } catch (err) {
            Modal.error({
                title: "Erro de cadastro",
                content: err.response.errors[0].message
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

    return (
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

            <User.Modal
                onSave={(user) => {
                    users.splice(0, 0, user)
                    form.setFieldsValue({user_id: user.id})
                }}
                id={selectedUserId}
                visible={showUserForm}
                onClose={() => setShowUserForm(false)}/>

            <Form.Item
                label="Usuário"
                name="user_id"
                extra='Pesquise pelo nome, email ou cpf'
                rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                <Select
                    disabled
                    suffixIcon={
                        <Tooltip title="Editar usuário">
                            <EditOutlined/>
                        </Tooltip>
                    }
                    showSearch
                    onSearch={loadUsers}
                    filterOption={() => true}
                    size='large'
                    options={users.map(({id, name}) => ({value: id, label: name}))}/>
            </Form.Item>

            <Row>
                <Col offset={4} span={16}>
                    <Divider>Matrícula</Divider>
                </Col>
            </Row>
            <Form.Item
                label="Curso"
                name="course_id"
                rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                <Select
                    size='large'
                    placeholder='Selecione um curso'
                    options={courses.map(({id, name}) => ({value: id, label: name}))}/>
            </Form.Item>
            {course && course.course_states.length > 0 && (
                <React.Fragment>
                    <Form.Item
                        label="Estado"
                        name="course_state_id">
                        <Select
                            size='large'
                            placeholder='Selecione um estado'
                            options={course.course_states.map(({id, state}) => ({
                                value: id,
                                label: state.name
                            }))}/>
                    </Form.Item>
                </React.Fragment>
            )}
            <Form.Item
                label="Valor"
                name="amount"
                rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                <Input disabled={user.account_id !== null} size='large'/>
            </Form.Item>
            <Form.Item
                label="Habilitar certificado"
                valuePropName='checked'
                name="enable_certificate">
                <Switch checkedChildren='Ativo' unCheckedChildren='Inativo'/>
            </Form.Item>
            {
            // @ts-ignore
            user.roles.includes(1) && (
                <Form.Item
                    label="Status"
                    name="order_status_id"
                    rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                    <Select
                        size='large'
                        options={order_status.map(({id, name}) => ({value: id, label: name}))}/>
                </Form.Item>
            )}

            <Form.Item wrapperCol={{offset: 4}}>
                {order?.order_status_id === 1 && (
                    <React.Fragment>
                        {order.payment_method === 'boleto' ? (
                            <a className="ant-btn" href={order.payment_url} target="_blank" rel="noreferrer">Visualizar
                                boleto</a>
                        ) : (
                            <Button
                                onClick={() => {
                                    Modal.info({
                                        title: "PIX",
                                        content: (
                                            <React.Fragment>
                                                <img
                                                    style={{margin: '2rem auto', display: 'block'}}
                                                    alt="Pix"
                                                    src={`https://chart.googleapis.com/chart?cht=qr&chs=300x300&chld=L|0&chl=${order?.payment_qrcode}`}/>
                                                <Input.TextArea autoSize readOnly value={order?.payment_qrcode}/>
                                            </React.Fragment>
                                        )
                                    })
                                }}>Visualizar PIX</Button>
                        )}
                    </React.Fragment>
                )}
                {/*
                {//@ts-ignore
                user.roles.includes(1) && (
                    <a className="ant-btn" href={`https://dashboard.pagar.me/#/transactions/${order.transaction_id}`} target="_blank" rel="noreferrer">Visualizar no Pagarme</a>
                )*/}
            </Form.Item>
        </Form>
    )
}

export default General
