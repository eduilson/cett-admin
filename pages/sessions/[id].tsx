import React from 'react'
import Router from 'next/router'

import {
    Button,
    Card,
    notification,
    Spin,
    Descriptions
} from 'antd'

import {
    DeleteOutlined,
} from '@ant-design/icons'

import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import Request from "@/utils/request";
import {User} from "@/types";
import dayjs from "dayjs";
import GlobalContext from "@/utils/globalContext";


const routes = [
    {
        link: '/',
        label: 'Início',
    },
    {
        label: 'Auto escolas',
        link: '/accounts'
    },
    {
        label: 'Editar registro',
        link: '/accounts'
    },
];

type Props = {
    user: User
    id: number
}

const Edit = ({user, id}: Props) => {
    const globalContext = React.useContext(GlobalContext)
    const [loading, setLoading] = React.useState(false)
    const [session, setSession] = React.useState<any>()

    React.useEffect(() => {
        globalContext.user.set(user)
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const data = (await Request(user.jwt.access_token).get(`admin/sessions/${id}`)).data
            setSession(data)

            setTimeout(() => toView(), 3000)
        } catch (e) {
        }
        setLoading(false)
    }

    const toView = async () => {
        try{
            (await Request(user.jwt.access_token).put(`admin/sessions/${id}`, {
                visualized: true
            })).data
        }catch (err){}
    }

    const destroy = async () => {
        setLoading(true)
        try {
            await Request(user.jwt.access_token).delete(`admin/sessions/${id}`);
            await Router.push('/sessions')
        } catch (err) {
            notification['error']({
                message: 'Não foi possível remover o registro. Por favor, tente novamente.'
            })
        }
        setLoading(false)
    }

    const extra = [
        <Button
            onClick={destroy}
            icon={<DeleteOutlined/>}
            type='primary' danger key='delete'>Deletar</Button>
    ];

    return (
        <Layout
            breadcrumb={routes}>
            <PageHeader
                extra={extra}
                title='Orçamento'
                onBack={() => Router.push("/sessions")}/>

            <Spin spinning={loading}>
                <Card title="Dados de cadastro" bordered={false}>
                    { session && (
                        <Descriptions bordered>
                            <Descriptions.Item label="Curso" span={3}>{session.course?.name}</Descriptions.Item>
                            <Descriptions.Item label="Estado">{session.state?.name || 'Não informado'}</Descriptions.Item>
                            <Descriptions.Item label="Cidade" span={2}>{session.city?.name || 'Não informado'}</Descriptions.Item>
                            <Descriptions.Item label="Data">{dayjs(session.created_at).format('DD/MM/YYYY H:m:s')}</Descriptions.Item>
                            <Descriptions.Item label="CPF">{session.cpf}</Descriptions.Item>
                            <Descriptions.Item label="Telefone">{session.phone || 'Não informado'}</Descriptions.Item>
                            <Descriptions.Item label="E-mail">{session.email || 'Não informado'}</Descriptions.Item>
                            <Descriptions.Item label="RENACH">{session.renach || 'Não informado'}</Descriptions.Item>
                            <Descriptions.Item label="Nascimento">{session.birth || 'Não informado'}</Descriptions.Item>
                            <Descriptions.Item label="RG" span={3}>{session.rg || 'Não informado'}</Descriptions.Item>

                            <Descriptions.Item label="CNH">{session.cnh || 'Não informado'}</Descriptions.Item>
                            <Descriptions.Item label="Validade CNH">{session.cnh_expiration || 'Não informado'}</Descriptions.Item>
                            <Descriptions.Item label="Categoria CNH">{session.cnh_category?.name || 'Não informado'}</Descriptions.Item>

                            <Descriptions.Item label="CEP">{session.postal_code || 'Não informado'}</Descriptions.Item>
                            <Descriptions.Item label="Endereço">{session.address || 'Não informado'}</Descriptions.Item>
                            <Descriptions.Item label="Número">{session.street_number || 'Não informado'}</Descriptions.Item>
                            <Descriptions.Item label="Bairro">{session.neighborhood || 'Não informado'}</Descriptions.Item>
                        </Descriptions>
                    ) }
                </Card>
            </Spin>
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

export default Edit
