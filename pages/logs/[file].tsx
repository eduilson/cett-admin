import React from "react"
import Router from "next/router"

import {
    Card,
    Button,
    Spin,
    notification
} from "antd";

import {
    ArrowLeftOutlined,
    SaveOutlined
} from "@ant-design/icons"

import getUser from "@/utils/getUser";
import Layout from "@/components/Layout"
import withSession from "@/utils/session";
import GlobalContext from "@/utils/globalContext";

import {
    User,
} from "@/types"

import Request from "@/utils/request";
import PageHeader from "@/components/PageHeader";


type Props = {
    user: User,
    file: string,
}

const Add = (props: Props) => {

    const {user, file} = props

    const globalContext = React.useContext(GlobalContext)
    const [loading, setLoading] = React.useState<boolean>(false)
    const [log, setLog] = React.useState<{ name?: string, size?: string, content?: string }>({})

    React.useEffect(() => {
        globalContext.user.set(user)
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const log = (await Request(user.jwt?.access_token).get(`admin/logs/${file}`)).data
            setLog(log)
        } catch (err) {
        }
        setLoading(false)
    }

    const clean = async () => {
        setLoading(true)
        try {
            await Request(user.jwt.access_token).delete(`admin/logs/${file}`)
            notification['success']({
                message: 'Arquivo de log limpo com sucesso.',
            })
            setLog({ ...log, content: '' })
        } catch (err) {
        }
        setLoading(false)
    }

    return (
        <Layout>
            <PageHeader
                onBack={() => Router.push("/logs")}
                title="Arquivo de log"
                extra={[
                    <Button
                        icon={<ArrowLeftOutlined/>}
                        key="back"
                        type="default"
                        onClick={() => Router.push("/logs")}>
                        Voltar
                    </Button>,
                    <Button
                        icon={<SaveOutlined/>}
                        loading={loading}
                        key="clean"
                        danger
                        type="primary"
                        onClick={() => clean()}>
                        Limpar
                    </Button>
                ]}/>

            <Spin spinning={loading}>
                <Card title={file} extra={log?.size || ''}>
                    <pre>{log?.content || ''}</pre>
                </Card>
            </Spin>
        </Layout>
    )
}

export const getServerSideProps = withSession(async function ({req, res, query}) {
    const user: User = await getUser(req, res)
    const {file} = query

    return {
        props: {
            user,
            file
        },
    };

})

export default Add
