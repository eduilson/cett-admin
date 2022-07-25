import React from 'react'
import Router from "next/router";
import clsx from "clsx";
import Echo from 'laravel-echo';
import client from 'pusher-js'
import dayjs from "dayjs";

import {
    Button,
    notification,
    Card,
    List,
    Comment,
    Form,
    Input,
    Divider,
    Col,
    Row
} from 'antd'

import Layout from "@/components/Layout"
import PageHeader from "@/components/PageHeader"

import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";
import {DirectMessage, User} from "@/types";

const routes = [
    {link: '/', label: 'Início'},
    {link: "/direct-messages", label: 'Mensagens'}
]

type Props = {
    user: User,
    tutor_id: number,
    student_id: number
}

const Index = ({user, tutor_id, student_id}: Props) => {

    const globalContext = React.useContext(GlobalContext)

    const [form] = Form.useForm()
    const listRef = React.useRef<HTMLDivElement>(null)
    const [loading, setLoading] = React.useState(true)
    const [directMessages, setDirectMessages] = React.useState<DirectMessage[]>([])
    const [tutor, setTutor] = React.useState<User | null>()
    const [student, setStudent] = React.useState<User | null>()
    const [pagination, setPagination] = React.useState({page: 1, lastPage: 999})

    React.useEffect(() => {
        globalContext.user.set(user)
        fetchData()
    }, [])

    React.useEffect(() => {
        const audio = new Audio("/alerts/swiftly-610.mp3")
        // @ts-ignore
        window.Pusher = client

        const echo = new Echo({
            broadcaster: 'pusher',
            key: process.env.NEXT_PUBLIC_PUSHER,
            authEndpoint: 'https://api.eadcursosdetransito.com.br/api/broadcasting/auth',
            host: 'https://api.eadcursosdetransito.com.br',
            auth: {
                headers: {
                    'Authorization': `Bearer ${user.jwt.access_token}`,
                    'Accept': 'application/json',
                }
            }
        })

        echo.private(`chat.${student_id}.${tutor_id}`)
            .listen('.new-message', (e: any) => {
                if(e.directMessage.author === 'student') {
                    setDirectMessages((directMessages) => [...directMessages, e.directMessage])
                    notification['info']({
                        message: `${user.name} acabou de enviar uma nova mensagem`
                    })
                    audio.play()
                    if (listRef.current) {
                        listRef.current.scrollTop = listRef.current.scrollHeight
                    }
                }
            })
    }, [])

    const getMessages = async (page = 1, scroll = true): Promise<any> => {
        setLoading(true)
        try {
            const direct_messages = (await Request(user.jwt.access_token).get(`admin/messages?tutor_id=${tutor_id}&user_id=${student_id}&page=${page}`)).data
            const student = (await Request(user.jwt.access_token).get(`admin/users/${student_id}`)).data
            const tutor = (await Request(user.jwt.access_token).get(`admin/users/${tutor_id}`)).data

            direct_messages.data.reverse()
            setDirectMessages([...direct_messages.data, ...directMessages])
            setPagination({
                lastPage: direct_messages.last_page,
                page: direct_messages.current_page
            })
            if (scroll && listRef.current) {
                listRef.current.scrollTop = listRef.current.scrollHeight
            }
            setLoading(false)
            return {student, tutor}
        } catch (err) {
            setLoading(false)
        }
    }

    const fetchData = async () => {
        try {
            const {student, tutor} = await getMessages()
            setTutor(tutor)
            setStudent(student)
        } catch (err) {
        }
    }

    const sendMessage = async (values: any) => {
        setLoading(true)
        try {
            const message = (await Request(user.jwt.access_token).post(`admin/messages`, {
                ...values,
                tutor_id,
                user_id: student_id
            })).data
            setDirectMessages([...directMessages, message])
            notification["success"]({
                message: "Mensagem enviada com sucesso."
            })

            if (listRef.current) {
                listRef.current.scrollTop = listRef.current.scrollHeight
            }

            form.setFieldsValue({text: ""})
        } catch (err) {
            notification["error"]({
                message: "Não foi possível enviar a mensagem. Por favor tente mais tarde."
            })
        }

        setLoading(false)
    }

    return (
        <Layout
            breadcrumb={routes}>
            <PageHeader onBack={() => Router.push(`/direct-messages/${tutor_id}`)} title="Mensagens"/>

            <Card title="Chat">
                <Row>
                    <Col lg={{offset: 4, span: 14}}>
                        <div className="chat-list" ref={listRef}>
                            {pagination.page < pagination.lastPage && (
                                <Button
                                    shape="round"
                                    className="load-more"
                                    size="large"
                                    loading={loading}
                                    onClick={() => getMessages(pagination.page + 1, false)}
                                    type="primary">Carregar mais</Button>
                            )}
                            <List
                                itemLayout="horizontal"
                                dataSource={directMessages}
                                renderItem={(direct_message: DirectMessage) => (
                                    <li className={clsx("chat-message", direct_message.author === 'tutor' && "reply")}>
                                        <Comment
                                            //actions={item.actions}
                                            author={direct_message.author === 'student' ? student?.name : tutor?.name}
                                            avatar={process.env.NEXT_PUBLIC_STORAGE_URL + ((direct_message.author === 'student' ? student?.avatar : tutor?.avatar) || 'placeholders/avatar.png')}
                                            content={direct_message.text}
                                            datetime={dayjs(direct_message.created_at).format('DD/MM/YYYY H:m:s')}
                                        />
                                    </li>
                                )}
                            />
                        </div>

                        <Divider className="chat-divider" orientation="left">Nova mensagem</Divider>

                        <Form
                            form={form} onFinish={sendMessage}>
                            <Form.Item
                                name="text"
                                rules={[{required: true, message: 'Insira uma mensagem'}]}>
                                <Input.TextArea rows={4}/>
                            </Form.Item>
                            <Form.Item>
                                <Button size="large" htmlType="submit" loading={loading} type="primary">
                                    Enviar
                                </Button>
                            </Form.Item>
                        </Form>

                    </Col>
                </Row>

            </Card>

        </Layout>
    )
}

export const getServerSideProps = withSession(async function ({req, res, query}) {
    const user = getUser(req, res);

    return {
        props: {
            user,
            tutor_id: query.tutor_id,
            student_id: query.student_id,
        },
    };
})

export default Index
