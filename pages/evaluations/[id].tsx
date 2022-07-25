import React from 'react'
import Router from "next/router";

import Layout from "@/components/Layout"
import PageHeader from "@/components/PageHeader";
import {Button, notification, Popconfirm} from "antd";

import {
    Card,
    Form,
    Space,
    Radio,
    Progress,
    Tag
} from "antd"

import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";
import {
    User,
    Evaluation as EvaluationT
} from "@/types";

type Props = {
    user: User,
    id: number,
}

const Evaluation = ({user, id}: Props) => {

    const globalContext = React.useContext(GlobalContext)

    const [loading, setLoading] = React.useState(true)
    const [evaluation, setEvaluation] = React.useState<EvaluationT>()

    React.useEffect(() => {
        globalContext.user.set(user)
        fetchData()
    }, [id])

    const fetchData = async () => {
        setLoading(true)
        try {
            const data = (await Request(user.jwt.access_token).get(`admin/evaluations/${id}`)).data
            setEvaluation(data)
        } catch (e) {
        }
        setLoading(false)
    }

    const routes = [
        {
            link: '/',
            label: 'Início',
        },
        {
            label: 'Progresso do curso',
            link: `/order/${evaluation?.order_id}/progress`,
        },
        {
            label: 'Avaliação',
        },
    ];

    const destroy = async () => {
        setLoading(true)

        try {
            await Request(user.jwt.access_token).delete(`/evaluations/${id}`)
            notification["success"]({
                message: "Avaliação excluída com sucesso."
            })
            await Router.push(`/orders/${evaluation?.order_id}/progress`)
        } catch (err) {
            notification["error"]({
                message: "Não foia possível excluir a avaliação."
            })
        }

        setLoading(false)
    }

    const extra = [
        <Popconfirm
            key='delete'
            placement='bottomRight'
            title="Têm certeza que deseja remover esse registro?"
            okText="Sim"
            onConfirm={destroy}
            cancelText="Não">
            <Button type='primary' danger>Deletar</Button>
        </Popconfirm>,
    ];

    return (
        <Layout breadcrumb={routes}>
            <PageHeader
                onBack={() => Router.push(`/orders/${evaluation?.order_id}/progress`)}
                extra={extra}
                title='Avaliação'/>

            <Card
                title="Respostas"
                className="responses"
                loading={loading}
                extra={[
                    <Space key="min_score">
                        <Space>
                            <strong>Nota mínima</strong>
                            <Progress
                                type="circle"
                                percent={evaluation?.model === 'Module' ? evaluation?.order?.course?.score_module_evaluation : evaluation?.order?.course?.score_course_evaluation}
                                strokeColor="#1aaf54"
                                width={80}/>
                        </Space>,
                        <Space key="score">
                            <strong>Resultado</strong>
                            <Progress
                                type="circle"
                                percent={evaluation?.score}
                                strokeColor={evaluation?.approved ? "#1aaf54" : "#f11e3f"}
                                width={80}/>
                        </Space>,
                        <Space key="approved">
                            <strong>Status</strong>
                            <Tag
                                color={evaluation?.approved ? "#1aaf54" : "#f11e3f"}>
                                {evaluation?.approved ? "Aprovado" : "Reprovado"}
                            </Tag>
                        </Space>
                    </Space>
                ]}>
                <Form>
                    {(evaluation?.responses || []).map((response, index) => (
                        <Form.Item
                            key={index}
                            className={`responses-item responses-item--${response.correct ? 'correct' : 'incorrect'}`}
                            labelCol={{span: 24}}
                            wrapperCol={{span: 24}}
                            name={['questions', index, 'question_option_id']}
                            initialValue={response.question_option_id || undefined}
                            label={
                                <div className="responses-item-label">
                                    <strong className="question-count">{index + 1})</strong>
                                    <div className="question-text"
                                         dangerouslySetInnerHTML={{__html: response.question.text}}/>
                                </div>
                            }>
                            <Radio.Group disabled size="large" className="evaluation-question-options">
                                {response.question.question_options.map(option => (
                                    <Radio
                                        className="evaluation-question-options-item"
                                        key={option.id}
                                        value={option.id}>{option.answer}</Radio>
                                ))}
                            </Radio.Group>
                        </Form.Item>
                    ))}
                </Form>
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

export default Evaluation
