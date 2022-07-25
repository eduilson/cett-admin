import React from 'react'
import Router from 'next/router'

import {
    Button,
    Card,
    Form,
    Tabs
} from 'antd'

import {
    SaveOutlined,
} from '@ant-design/icons'

import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";
import {User} from "@/types";
import Role from '@/components/Role'

const breadcrumb = [
    {label: 'Início', link: '/'},
    {label: 'Funções', link: '/roles'},
    {label: 'Editar registro'}
]

type Props = {
    user: User
    id: number
}

const Add = ({user, id}: Props) => {

    const globalContext = React.useContext(GlobalContext)

    const [form] = Form.useForm()
    const [menuForm] = Form.useForm()
    const [enableAdmin, setEnableAdmin] = React.useState(false)
    const [tab, setTab] = React.useState('general')

    React.useEffect(() => {
        globalContext.user.set(user)
    }, [])

    const extra = [
        <Button
            icon={<SaveOutlined/>}
            type='primary'
            onClick={() => {
                if(tab === 'general'){
                    form.submit()
                }else{
                    menuForm.submit()
                }
            }}
            key='save'>Salvar
    </Button>];

    return (
        <Layout breadcrumb={breadcrumb}>
            <PageHeader
                extra={extra}
                onBack={() => Router.push('/roles')}
                title='Editar grupo de usuário'/>

            <Card title="Dados de cadastro" bordered={false}>
                <Tabs tabPosition="left" onChange={setTab}>
                    <Tabs.TabPane tab="Geral" key="general">
                        <Role.General id={id} form={form} enableAdmin={setEnableAdmin} />
                    </Tabs.TabPane>
                    { enableAdmin && (
                        <Tabs.TabPane tab="Menu" key="menu">
                            <Role.Menu form={menuForm} id={id} />
                        </Tabs.TabPane>
                    ) }
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
