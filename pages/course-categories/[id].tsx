import React from 'react'
import Router from 'next/router'

import {
    Button,
    Card,
    Form,
    Input,
    notification
} from 'antd'

import {
    SaveOutlined,
} from '@ant-design/icons'

import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";

import {
    User as UserT
} from "@/types";

const layout = {
    labelCol: {span: 4},
    wrapperCol: {span: 16},
};

const routes = [
    {link: '/', label: 'Início'},
    {link: '/course-categories', label: 'Categorias'},
    {label: 'Novo registro'}
]

type Props = {
    user: UserT,
    id: number,
}

const Add = ({user, id}: Props) => {

    const globalContext = React.useContext(GlobalContext)

    const [form] = Form.useForm()
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        globalContext.user.set(user)
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try{
            const response = (await Request(user.jwt.access_token).get(`admin/course-categories/${id}`)).data
            form.setFieldsValue(response)
        }catch (err){}
        setLoading(false)
    }

    const onFinish = async (values: any) => {
        setLoading(true)
        try {
            await Request(user.jwt.access_token).put(`admin/course-categories/${id}`, values)
            await Router.push('/testimonials')
        } catch (err) {
            notification['error']({
                message: 'Não foi possível salvar o depoimento'
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
        <Layout breadcrumb={routes}>
            <Form
                form={form}
                {...layout}
                name="menu-form"
                onFinish={onFinish}
                autoComplete="off">

                <PageHeader
                    onBack={() => Router.push('/course-categories')}
                    extra={extra}
                    title="Editar registro"/>

                <Card
                    title="Dados de cadastro"
                    bordered={false}
                    loading={loading}>
                    <Form.Item
                        label="Nome"
                        name="name"
                        rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                        <Input size="large" />
                    </Form.Item>
                </Card>
            </Form>
        </Layout>
    )
}

export const getServerSideProps = withSession(function ({req, res, query}) {
    const user = getUser(req, res);

    return {
        props: {
            user,
            id: query.id
        },
    };
})

export default Add
