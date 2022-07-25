import React from 'react'
import arrayMove from 'array-move'
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  DragOutlined
} from '@ant-design/icons'

import Layout from "@/components/Layout"
import PageHeader from "@/components/PageHeader"

import {
  List,
  Row,
  Col,
  Card,
  notification
} from 'antd';

import Link from "next/link";
import {Button} from "antd";
import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";
import {Banner, User} from "@/types";

const routes = [
  {
    link: '/',
    label: 'Início',
  },
  {
    link: '/banners',
    label: 'Banners',
  },
  {
    label: 'Ordenação',
  }
];

const SortableItem = SortableElement(({banner}: { banner: Banner }) => (
  <List.Item style={{cursor: 'grab'}}>
    <List.Item.Meta
      avatar={<DragOutlined />}
      title={`#${banner.id} - ${banner.title}`} />
  </List.Item>
));

const SortableList = SortableContainer(({banners}: {banners: Banner[]}) => {
  return (
    <List bordered>
      {banners.map((banner, index) => (
        <SortableItem key={`item-${banner.id}`} index={index} banner={banner} />
      ))}
    </List>
  );
});

type Props = {
  user: User
}

const Sort = ({ user }: Props) => {
  const globalContext = React.useContext(GlobalContext)
  const [loading, setLoading] = React.useState(false)
  const [data, setData] = React.useState([])

  React.useEffect(() => {
    globalContext.user.set(user)
    fetchData()
  }, [])

 const fetchData = async () => {
    setLoading(true)
    try{
      const response = (await Request(user.jwt.access_token).get('admin/banners')).data
      setData(response.data)
    }catch (err){}
    setLoading(false)
  }

  const save = async () => {
    setLoading(true)
    try{
      await Request(user.jwt.access_token).put('/banners/sort', {banners: data})
      notification['success']({
        message: 'Ordenação salva com sucesso!'
      })
    }catch (err){
      notification['error']({
        message: 'Ocorreu um erro ao salvar a ordenação.'
      })
    }
    setLoading(false)
  }

  const onSortEnd = ({oldIndex, newIndex}: {oldIndex: number, newIndex: number}) => {
    setData(arrayMove(data, oldIndex, newIndex));
  };

  return (
    <Layout
      breadcrumb={routes}>
      <PageHeader
        title="Ordenação"
        extra={[
          <Link href='/banners' key='back' passHref>
            <Button icon={<ArrowLeftOutlined />} type='default'>Voltar</Button>
          </Link>,
          <Button key='save' icon={<SaveOutlined />} type='primary' onClick={save}>Salvar</Button>
        ]}
      />

      <Row style={{marginTop: '2rem'}}>
        <Col lg={{offset: 6, span: 12}}>
          <Card title='Banners' loading={loading}>
            <SortableList banners={data} onSortEnd={onSortEnd} />
          </Card>
        </Col>
      </Row>
    </Layout>
  )
}

export const getServerSideProps = withSession(function ({req, res}) {
  const user = getUser(req, res);

  return {
    props: {
      user,
    },
  };
})

export default Sort
