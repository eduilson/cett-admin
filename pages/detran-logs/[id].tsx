import React from 'react'
import Router from 'next/router'
/** @ts-ignore */
import Highlight from 'react-highlight'
import "highlight.js/styles/base16/dracula.css"

import {
  Button, Card, Typography,
} from 'antd'

import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";
import {DetranLog, User} from "@/types";

const routes = [
  {link: '/', label: 'Início'},
  {link: '/logs', label: 'Logs'},
  {label: 'Visualizar'}
]

type Props = {
  user: User
  id: number
}

const Edit = ({ user, id }: Props) => {

  const globalContext = React.useContext(GlobalContext)

  const [loading, setLoading] = React.useState(false)
  const [log, setLog] = React.useState<DetranLog>()

  React.useEffect(() => {
    globalContext.user.set(user)
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const log = (await Request(user.jwt.access_token).get(`admin/detran-logs/${id}`)).data

      setLog({
        ...log,
        parameters: JSON.stringify(log.parameters, null, 2),
        sending_data: JSON.stringify(log.sending_data, null, 2),
        received_data: JSON.stringify(log.received_data, null, 2),
      })
    }catch (err){
      console.log(err)
    }
    setLoading(false)
  }

  return (
    <Layout breadcrumb={routes}>
      <PageHeader
        onBack={() => Router.push('/detran-logs')}
        title='Logs de Integração'
        extra={[
          <Button type="default" key="back" onClick={() => Router.push("/detran-logs")}>Voltar</Button>,
        ]} />

      <Card title="Log Detran" loading={loading}>
          <Typography style={{marginBottom: 8}}>Parâmetros</Typography>
          <Highlight language="json">
            { log?.parameters }
          </Highlight>

          <Typography style={{marginBottom: 8}}>Dados enviados</Typography>
          <Highlight language="json">
            { log?.sending_data }
          </Highlight>

          <Typography style={{marginBottom: 8}}>Dados recebidos</Typography>
          <Highlight language="json">
            { log?.received_data }
          </Highlight>
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

export default Edit
