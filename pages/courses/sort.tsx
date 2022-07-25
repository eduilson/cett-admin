import React from 'react'
import arrayMove from 'array-move'
import {SortableContainer, SortableElement, SortEnd} from 'react-sortable-hoc';
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
import {Course, User} from "@/types";

const routes = [
  {
    link: '/',
    label: 'Início',
  },
  {
    link: '/courses',
    label: 'Cursos',
  },
  {
    label: 'Ordenação',
  }
];

const SortableItem = SortableElement(({course}: {course: Course}) => (
  <List.Item style={{cursor: 'grab'}}>
    <List.Item.Meta
      avatar={<DragOutlined />}
      title={course.name} />
  </List.Item>
));

const SortableList = SortableContainer(({courses}: {courses: Course[]}) => {
  return (
    <List bordered>
      {courses.map((course, index) => (
        <SortableItem key={`item-${course.id}`} index={index} course={course} />
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
  const [data, setData] = React.useState<Course[]>([])

  React.useEffect(() => {

    globalContext.user.set(user)
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try{
      const response = (await Request(user.jwt.access_token).get('admin/courses?per_page=999&status=1')).data
      setData(response.data)
    }catch (err){}
    setLoading(false)
  }

  const save = async () => {
    setLoading(true)
    try{
      await Request(user.jwt.access_token).post('admin/courses/sort', {courses: data})
      notification['success']({
        message: 'Ordenação salva com sucesso!'
      })
    }catch (err){}
    setLoading(false)
  }

  const onSortEnd = ({oldIndex, newIndex}: SortEnd) => {
    setData(arrayMove(data, oldIndex, newIndex));
  };

  return (
    <Layout
      breadcrumb={routes}>
      <PageHeader
        title="Ordenação"
        extra={[
          <Link href='/courses' key='back' passHref>
            <Button icon={<ArrowLeftOutlined />} type='default'>Voltar</Button>
          </Link>,
          <Button key='save' icon={<SaveOutlined />} type='primary' onClick={save}>Salvar</Button>
        ]}
      />

      <Row style={{marginTop: '2rem'}}>
        <Col lg={{offset: 6, span: 12}}>
          <Card title='Cursos' loading={loading}>
            <SortableList courses={data} onSortEnd={onSortEnd} />
          </Card>
        </Col>
      </Row>

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


export default Sort
