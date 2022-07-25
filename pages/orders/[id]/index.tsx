import React from 'react'
import Router from 'next/router'

import {
    Button,
    Form,
    Modal,
    Spin,
    Tabs,
    Card
} from 'antd'

import {
    SaveOutlined,
    DeleteOutlined,
    LineChartOutlined,
    PlusOutlined,
    FilePdfOutlined
} from '@ant-design/icons'

import PageHeader from "@/components/PageHeader"
import Layout from "@/components/Layout"

import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";

import Order from '@/components/Order'

import {
    User as UserT
} from "@/types";

const routes = [
    {link: '/', label: 'Início'},
    {link: '/orders', label: 'Matrículas'},
    {label: 'Novo registro'}
]

type Props = {
    id: number,
    user: UserT
}

const Add = ({user, id}: Props) => {

    const globalContext = React.useContext(GlobalContext)
    const [form] = Form.useForm();

    const [loading, setLoading] = React.useState(false)
    const [showUserForm, setShowUserForm] = React.useState<boolean>(false)
    const [showCertificate, setShowCertificate] = React.useState<boolean>(false)
    const [orderSlug, setOrderSlug] = React.useState<string>()

    React.useEffect(() => {
        globalContext.user.set(user)
    }, [])

    const destroy = async () => {
        setLoading(true)
        try{
            await Request(user.jwt.access_token).delete(`admin/orders/${id}`)
            await Router.push('/orders')
        }catch (err){
            Modal.error({
                title: "Não foi possível excluir o registro. Por favor, tente novamente mais tarde.",
            })
        }
        setLoading(false)
    }

    const extra = [
        <Button
            icon={<LineChartOutlined />}
            onClick={() => Router.push(`/orders/${id}/progress`)}
            key='progress'>Progresso
        </Button>,
        <Button
            icon={<SaveOutlined/>}
            type='primary'
            key='save'
            onClick={() => form.submit()}
            loading={loading}>Salvar
        </Button>,
        <Button
            icon={<DeleteOutlined />}
            type='primary'
            key='destroy'
            onClick={destroy}
            danger
            loading={loading}>Excluir
        </Button>,
    ];

    if(showCertificate){
        extra.splice(1, 0,
            <Button
                href={`https://eadcursosdetransito.com.br/certificado/${orderSlug}`}
                target="_blank"
                icon={<FilePdfOutlined />}
                key='certificate'>Certificado
            </Button>
        )
    }

    return (
        <Layout breadcrumb={routes}>
            <PageHeader
                onBack={() => Router.push('/orders')}
                extra={extra}
                title='Editar matrícula'/>
            <Card
                title="Dados de cadastro"
                bordered={false}
                extra={<Button icon={<PlusOutlined/>} onClick={() => setShowUserForm(true)}>Novo usuário</Button>}>
                <Tabs tabPosition="left">
                    <Tabs.TabPane tab="Geral" key="general">
                        <Spin spinning={loading}>
                        <Order.General
                            id={id}
                            form={form}
                            user={user}
                            showUserForm={showUserForm}
                            setShowUserForm={setShowUserForm}
                            setOrderSlug={setOrderSlug}
                            setShowCertificate={setShowCertificate}
                            setLoading={setLoading}/>
                        </Spin>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Integração Detran" key="detran_logs">
                        {<Order.DetranLogs id={id} />}
                    </Tabs.TabPane>
                </Tabs>
            </Card>
        </Layout>
    )
}

export const getServerSideProps = withSession(async function ({req, res, query}) {
    const user = getUser(req, res);

    return {
        props: {
            user,
            id: query.id
        },
    };
})

export default Add
