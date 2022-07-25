import React from 'react'
import Router from "next/router";
import Link from 'next/link'

import {
  Card,
  List,
  Avatar,
  Badge
} from 'antd'

import Layout from "@/components/Layout"
import PageHeader from "@/components/PageHeader"

import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";
import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import {DirectMessage, User} from "@/types";

type Props = {
  user: User,
  tutor_id: number
}

const Index = ({ user, tutor_id }: Props) => {

  const globalContext = React.useContext(GlobalContext)

  const [loading, setLoading] = React.useState(true)
  const [directMessages, setDirectMessages] = React.useState<DirectMessage[]>([])
  const [tutor, setTutor] = React.useState<User>()
  const [routes, setRoutes] = React.useState([
    { link: '/', label: 'Início', },
    { label: 'Mensagens', }
  ])

  React.useEffect(() => {
    globalContext.user.set(user)
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try{
      const tutor = (await Request(user.jwt.access_token).get('admin/users/' + tutor_id)).data
      const { direct_messages } = (await Request(user.jwt.access_token).get('admin/chats/' + tutor_id)).data
      setDirectMessages(direct_messages)
      setTutor(tutor)
      setRoutes([
        ...routes,
        { label: tutor.name }
      ])
    }catch (err){}
    setLoading(false)
  }

  return(
    <Layout
      breadcrumb={routes}>
      <PageHeader onBack={() => Router.push('/direct-messages')} title="Mensagens" />

      <Card title={tutor?.name || "Tutor"} loading={loading}>
        <List
          itemLayout="horizontal"
          dataSource={directMessages}
          renderItem={(directMessage: DirectMessage) => (
            <List.Item extra={
              <Link href={`/direct-messages/${tutor_id}/${directMessage.user_id}`}>
                <a>Visualizar</a>
              </Link>
            }>
              <List.Item.Meta
                avatar={
                  <Badge count={ directMessage.student?.unread_messages || 0 }>
                    <Avatar src={ process.env.NEXT_PUBLIC_STORAGE_URL + (directMessage.student?.avatar || 'placeholders/avatar.png') } size={50} />
                  </Badge>
                }
                title={<a href={`/direct-messages/${tutor_id}/${directMessage.user_id}`}>{directMessage.student?.name}</a>}
                description={ `Total de mensagens: (${directMessage.student?.direct_messages_count || 0})` }
              />
            </List.Item>
          )}
        />
      </Card>
    </Layout>
  )
}

export const getServerSideProps = withSession(async function ({req, res, query}) {
  const user = getUser(req, res);

  return {
    props: {
      user,
      tutor_id: query.tutor_id
    },
  };
})

export default Index
