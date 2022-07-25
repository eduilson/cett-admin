import React from 'react'
import Link from 'next/link'

import {
  Card,
  List,
  Avatar,
  Badge
} from 'antd'

import Layout from "@/components/Layout"
import PageHeader from "@/components/PageHeader"

import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";
import {User} from "@/types";

const routes = [
  {
    link: '/',
    label: 'Início',
  },
  {
    label: 'Mensagens',
  }
];

type Props = {
  user: User
}

const Index = ({ user }: Props) => {

  const globalContext = React.useContext(GlobalContext)

  const [loading, setLoading] = React.useState(true)
  const [tutors, setTutors] = React.useState<User[]>([])

  React.useEffect(() => {
    globalContext.user.set(user)
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try{
      const { data } = (await Request(user.jwt.access_token).get('admin/users?role_id=4')).data
      setTutors(data)
    }catch (err){}
    setLoading(false)
  }

  return(
    <Layout
      breadcrumb={routes}>
      <PageHeader title="Mensagens" />

      <Card title="Tutores" loading={loading}>
        <List
          itemLayout="horizontal"
          dataSource={tutors}
          renderItem={(tutor: User) => (
            <List.Item extra={
              <Link href={`/direct-messages/${tutor.id}`}>
                <a>Visualizar</a>
              </Link>
            }>
              <List.Item.Meta
                avatar={
                  <Badge count={ tutor.unread_messages }>
                    <Avatar src={ process.env.NEXT_PUBLIC_STORAGE_URL + (tutor.avatar || 'placeholders/avatar.png') } size={50} />
                  </Badge>
                }
                title={<a href={`/direct-messages/${tutor.id}`}>{tutor.name}</a>}
                description={ "Total de mensagens: ("+tutor.direct_messages_count+")" }
              />
            </List.Item>
          )}
        />
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
