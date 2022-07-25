import React from 'react'
import Link from 'next/link'
import dayjs from "dayjs";

import {
    Descriptions,
    Card,
    List,
    Tag,
    Progress,
    Table,
    Space,
    Button,
    Popconfirm,
    notification
} from 'antd'

import {
    LockTwoTone,
    UnlockTwoTone,
} from "@ant-design/icons"

import PageHeader from "@/components/PageHeader"
import Layout from "@/components/Layout"

import Router, {useRouter} from 'next/router'
import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";
import {ColumnsType} from "antd/lib/table";

import {
  Evaluation,
  Lesson, Module,
  Order,
  User
} from "@/types";

type Props = {
    user: User
}

const Index = ({user}: Props) => {

    const globalContext = React.useContext(GlobalContext)

    const {id} = useRouter().query
    const [order, setOrder] = React.useState<Order|any>()
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {

        globalContext.user.set(user)

        if (id) {
            fetchData()
        }
    }, [id])

    const fetchData = async () => {
        setLoading(true)
        try {
            const data = (await Request(user.jwt.access_token).get(`admin/order-progress/${id}`)).data
            setOrder(data)
        } catch (err) {
        }
        setLoading(false)
    }

    const destroyModuleEvaluation = async (id: number) => {
        try {
            (await Request(user.jwt.access_token).delete(`admin/evaluations/${id}`))
            setOrder({
                ...order,
                modules: order?.modules ? order.modules.map((module: Module) => ({
                    ...module,
                    evaluations: module.evaluations.filter((evaluation) => evaluation.id !== id)
                })) : []
            })
            notification["success"]({
                message: "Registro excluído com sucesso"
            })
        } catch (err) {
            notification["error"]({
                message: "Não foi possível remover o registro. Tente novamente mais tarde."
            })
        }
    }

    const routes = [
        {link: '/', label: 'Início'},
        {link: '/orders', label: 'Matrículas'},
        {link: `/orders/${id}`, label: 'Editar registro'},
        {label: 'Progresso do Curso'},
    ]

    const StatusColumn = (approved: boolean) => (
        <Tag color={approved ? "#1aaf54" : "#f11e3f"}>
            {approved ? "Aprovado" : "Reprovado"}
        </Tag>
    )

    const ActionsColumn = (evaluation: Evaluation) => (
        <Space>
            <Link href={`/evaluations/${evaluation.id}`}>
                <Button size="small" type="primary">Visualizar</Button>
            </Link>
            <Popconfirm
                title="Têm certeza que deseja remover esse registro?"
                onConfirm={() => destroyModuleEvaluation(evaluation.id)}
                okText="Deletar"
                cancelText="Cancelar">
                <Button size="small" type="primary" danger>Deletar</Button>
            </Popconfirm>
        </Space>
    )

    const evaluationColumns: ColumnsType<any> = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id"
        },
        {
            title: "Data",
            dataIndex: "created_at",
            render: created_at => dayjs(created_at).format('DD/MM/YYYY HH:mm:ss'),
            key: "created_at"
        },
        {
            title: "Nota",
            dataIndex: "score",
            key: "score",
            render: score => score.toFixed(2) + "%"
        },
        {
            title: "Status",
            dataIndex: "approved",
            key: "approved",
            render: approved => StatusColumn(approved)
        },
        {
            align: "right",
            key: "actions",
            render: evaluation => ActionsColumn(evaluation)
        }
    ]

    const toggleAccess = async (module_id: number, lesson_id: number, lock: boolean) => {
        setLoading(true)
        try {
            await Request(user.jwt.access_token).put(`admin/order-progress/${id}`, {
                module_id,
                lesson_id,
                lock
            })
            fetchData()
        } catch (err) {
        }
    }

    return (
        <Layout breadcrumb={routes}>
            <PageHeader
                onBack={() => Router.push(`/orders/${id}`)}
                title='Progresso do curso'/>

            <Card title={order?.course?.name || 'Curso'} loading={loading}>
                <Descriptions layout="vertical">
                    {(order?.modules || []).map((module: Module) => {
                        let sliders_count = 0
                        let access_logs_count = 0

                        for (const lessons of module.lessons) {
                            sliders_count += lessons.sliders_count || 0
                            access_logs_count += lessons.access_logs_count || 0
                        }

                        let moduleProgress = access_logs_count / sliders_count * 100

                        return (
                            <Descriptions.Item label={module.title} span={3} key={module.id}>
                                <List
                                    style={{width: "100%"}}
                                    rowKey="id"
                                    size="small"
                                    header={
                                        <div style={{display: "flex", alignItems: "center"}}>
                                            <strong style={{marginRight: "auto"}}>Tópicos</strong>
                                            <div style={{width: 170}}>
                                                <Progress percent={parseFloat(moduleProgress.toFixed(2))} size="small"/>
                                            </div>
                                        </div>
                                    }
                                    footer={
                                        module.evaluations.length > 0 ? (
                                            <Table
                                                rowKey="id"
                                                title={() => <strong>Simulados</strong>}
                                                size="small"
                                                columns={evaluationColumns}
                                                pagination={{pageSize: 5}}
                                                dataSource={module.evaluations}/>
                                        ) : false
                                    }
                                    bordered
                                    dataSource={module.lessons}
                                    renderItem={(lesson: Lesson) => {
                                        /** @ts-ignore **/
                                        const {sliders_count, access_logs_count} = lesson
                                        let lessonProgress = access_logs_count / sliders_count * 100
                                        const unlocked = lessonProgress >= 100;

                                        return (
                                            <List.Item
                                                extra={
                                                    unlocked ?
                                                        <Popconfirm
                                                            title="Essa ação irá excluir todos os logs de acesso até o presente tópico. Deseja continuar?"
                                                            onConfirm={() => toggleAccess(module.id, lesson.id, true)}
                                                            okText="Continuar"
                                                            placement="leftBottom"
                                                            cancelText="Cancelar">
                                                            <LockTwoTone twoToneColor="#f11e3f"/>
                                                        </Popconfirm> :
                                                        <Popconfirm
                                                            title="O aluno terá acesso a todo conteúdo até o presente tópico. Deseja continuar?"
                                                            onConfirm={() => toggleAccess(module.id, lesson.id, false)}
                                                            okText="Continuar"
                                                            placement="leftBottom"
                                                            cancelText="Cancelar">
                                                            <UnlockTwoTone twoToneColor="#1aaf54"/>
                                                        </Popconfirm>
                                                }>
                                                <List.Item.Meta
                                                    title={lesson.name}
                                                    description={
                                                        sliders_count > 0 ? (
                                                            <Progress
                                                                percent={lessonProgress}
                                                                steps={sliders_count}
                                                                strokeColor="#52c41a"
                                                                trailColor="#f11e3f"/>
                                                        ) : false
                                                    }
                                                />
                                            </List.Item>
                                        )
                                    }}
                                />
                            </Descriptions.Item>
                        )
                    })}
                    <Descriptions.Item label="Avaliações" span={3}>
                        <Table
                            style={{width: "100%"}}
                            rowKey="id"
                            size="small"
                            columns={evaluationColumns}
                            pagination={{pageSize: 5}}
                            dataSource={order?.evaluations || []}/>
                    </Descriptions.Item>
                    { (order?.evaluations.length > 0 && order?.evaluations.filter((e: Evaluation) => e.approved).length > 0) && (
                        <Descriptions.Item label="Relatórios">
                            <Button onClick={() => {
                                window.open(process.env.NEXT_PUBLIC_API_URL + `admin/completion-report/${id}?token=${user.jwt.access_token}`)
                            }}>Relatório de conclusão</Button>
                        </Descriptions.Item>
                    )}
                </Descriptions>
            </Card>
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

export default Index
