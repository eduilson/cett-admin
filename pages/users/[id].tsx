import React from 'react'
import Router from 'next/router'

import {
    Button,
    Card,
    Tabs,
    notification
} from 'antd'

import {SaveOutlined, DeleteOutlined} from '@ant-design/icons'

import Layout from "@/components/Layout"
import PageHeader from "@/components/PageHeader"
import UserForm from "@/components/User"

import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";

import {
    User
} from "@/types";
import Request from "@/utils/request";

const routes = [
    {
        link: '/',
        label: 'Início',
    },
    {
        link: '/users',
        label: 'Usuários',
    },
    {
        label: 'Editar usuário',
    }
];

type Props = {
    user: User,
    id: number
}

const Edit = (props: Props) => {

    const globalContext = React.useContext(GlobalContext)
    const formRef = React.useRef()
    const bankAccountFormRef = React.useRef()
    const [loading, setLoading] = React.useState(false)
    const [user, setUser] = React.useState<User>()
    const [tab, setTab] = React.useState<string>('general')

    const { id } = props

    React.useEffect(() => {
        globalContext.user.set(props.user)

        getUser()
    }, [])

    const getUser = async () => {
        try{
            const response = (await Request(props.user.jwt.access_token).get(`admin/users/${id}`)).data
            setUser(response)
        }catch (err){}
    }

    const successMessage = () => {
        notification['success']({
            placement: 'bottomRight',
            message: 'Sucesso',
            description: 'Registro alterado com sucesso.',
        });
    }

    const destroy = async () => {
        setLoading(true)
        try {
            await Request(props.user.jwt.access_token).delete(`/admin/users/${props.id}`)
            await Router.push('/users')
        } catch (e) {
            notification['error']({
                message: 'Não foi possível remover o usuário. Por favor, tente novamente.'
            })
        }
        setLoading(false)
    }

    const extra = [
        <Button
            icon={<SaveOutlined/>}
            type='primary'
            onClick={() => {
                if(tab === 'general') {
                    //@ts-ignore
                    formRef?.current?.submit()
                }else{
                    //@ts-ignore
                    bankAccountFormRef?.current?.submit()
                }
            }}
            key='save'>Salvar</Button>,
        <Button icon={<DeleteOutlined/>} type='primary' danger key='delete' onClick={destroy}>Deletar</Button>
    ]

    return (
        <Layout
            breadcrumb={routes}>

            <PageHeader
                onBack={() => Router.push('/users')}
                title='Editar usuário'
                extra={extra}/>

            <Card title="Dados de cadastro" bordered={false} loading={loading}>
                <Tabs tabPosition="left" onChange={setTab}>
                    <Tabs.TabPane tab="Geral" key="general">
                        <UserForm.Form ref={formRef} id={id} onSave={successMessage} />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Matrículas" key="orders">
                        <UserForm.Orders id={id}/>
                    </Tabs.TabPane>
                    { (user && user.roles.filter(r => r.id === 2 || r.id === 8).length > 0) && (
                        <React.Fragment>
                            <Tabs.TabPane tab="Dados bancários" key="bank_account">
                                <UserForm.BankAccount id={id} ref={bankAccountFormRef} />
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="Saldo" key="balance">
                                <UserForm.Balance id={id} />
                            </Tabs.TabPane>
                        </React.Fragment>
                    ) }
                </Tabs>
            </Card>
        </Layout>
    )
}

export const getServerSideProps = withSession(async function ({req, res, query}) {
    const user = await getUser(req, res);

    return {
        props: {
            user,
            id: query.id
        },
    };
})

export default Edit
