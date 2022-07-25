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
    user: UserT
}

const Add = ({user}: Props) => {

    const globalContext = React.useContext(GlobalContext)

    const [form] = Form.useForm()
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        globalContext.user.set(user)
    }, [])

    const onFinish = async (values: any) => {
        setLoading(true)
        try {
            await Request(user.jwt.access_token).post('admin/course-categories', values)
            await Router.push('/course-categories')
        } catch (err) {
            notification['error']({
                message: 'Não foi possível salvar o registro'
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
                    title="Novo registro"/>

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

export const getServerSideProps = withSession(function ({req, res}) {
    const user = getUser(req, res);

    return {
        props: {
            user,
        },
    };
})

export default Add
