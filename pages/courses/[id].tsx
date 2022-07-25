import React from 'react'
import Router from 'next/router'

import {
    Button,
    Card,
    Form,
    Tabs,
    notification,
    Spin,
} from 'antd'

import {
    SaveOutlined
} from '@ant-design/icons'

import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'

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
        label: 'Novo curso',
    }
];

const layout = {
    labelCol: {span: 4},
    wrapperCol: {span: 16},
};

import {
    Banners,
    Evaluation,
    Simulated,
    Modules,
    States,
    Libraries,
    Price,
    General,
    Tutors,
    //Certificated
    Contracts,
} from '@/components/Course'

import withSession from "@/utils/session";
import getUser from "@/utils/getUser";
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";
import { User } from "@/types";

type Props = {
    user: User,
    id: number,
}

const Edit = (props: Props) => {

    const {user, id} = props

    const globalContext = React.useContext(GlobalContext)

    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState(false)
    const [courseCodes, setCourseCodes] = React.useState([])
    const [courseScopes, setCourseScopes] = React.useState([])
    const [courseCategories, setCourseCategories] = React.useState([])
    const [submitKeep, setSubmitKeep] = React.useState(false)
    const [courseScopeId, setCourseScopeId] = React.useState<number>(3)

    let bannerProps = {}

    React.useEffect(() => {

        globalContext.user.set(user)

        fetchData()
    }, [])

    const fetchData = () => {
        setLoading(true)
        const courseCodes = Request(user.jwt.access_token).get('admin/course-codes')
        const courseScopes = Request(user.jwt.access_token).get('admin/course-scopes')
        const courseCategories = Request(user.jwt.access_token).get('admin/course-categories?per_page=999')
        const course = Request(user.jwt.access_token).get(`admin/courses/${id}`)

        Promise.all([courseCodes, courseScopes, course, courseCategories]).then((values) => {
            const [courseCodes, courseScopes, course, courseCategories] = values
            setCourseCodes(courseCodes.data)
            setCourseScopes(courseScopes.data)
            setCourseCategories(courseCategories.data.data)
            setCourseScopeId(course.data.course_scope_id)
            setLoading(false)

            form.setFieldsValue({
                ...course.data,
                tutors: course.data.tutors.map(({ id }: any) => id),
            })
        })
    }

    const onFinish = async (values: any) => {
        setLoading(true)

        try {
            await Request(user.jwt.access_token).put(`admin/courses/${id}`, values)
            notification['success']({
                message: 'Registro salvo com sucesso.'
            })
            if (!submitKeep) {
                await Router.push('/courses')
            }
        } catch (err) {
            notification['error']({
                message: 'Não foi possível salvar o registro.'
            })
        }

        setLoading(false)
    }

    const onSubmit = (keep = false) => {
        setSubmitKeep(keep)
        form.submit()
    }

    let actions = [
        <Button
            icon={<SaveOutlined/>}
            type='primary'
            key='save'
            onClick={() => form.submit()}>Salvar e sair</Button>,
        <Button
            icon={<SaveOutlined/>}
            type='primary'
            key='save-keep'
            onClick={() => onSubmit(true)}>Salvar</Button>
    ];

    return (
        <Layout breadcrumb={routes}>
            <Form
                form={form}
                {...layout}
                name="menu-form"
                onFinish={onFinish}
                autoComplete="off">

                <PageHeader
                    onBack={() => Router.push('/courses')}
                    title='Editar curso'
                    extra={actions}/>

                <Spin spinning={loading}>
                    <Card
                        title='Dados de cadastro'
                        bordered={false}>
                        <Tabs defaultActiveKey="general" tabPosition='left' tabBarStyle={{width: 170}}>
                            <Tabs.TabPane tab="Conteúdo" key="general" forceRender>
                                <General
                                    courseCategories={courseCategories}
                                    setCourseScope={setCourseScopeId}
                                    courseScopes={courseScopes}
                                    courseCodes={courseCodes}/>
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="Banners" key="banners" forceRender>
                                <Banners {...bannerProps} />
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="Preço" key="price" forceRender>
                                <Price/>
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="Simulado" key="simulated" forceRender>
                                <Simulated/>
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="Avaliação" key="evaluation" forceRender>
                                <Evaluation/>
                            </Tabs.TabPane>
                            {/*
                            <Tabs.TabPane tab="Certificado" key="certificated" forceRender>
                                <Certificated/>
                            </Tabs.TabPane>
                            */}
                            <Tabs.TabPane tab="Tutores" key="tutors" forceRender>
                                <Tutors />
                            </Tabs.TabPane>
                            { courseScopeId !== 3 && (
                                <Tabs.TabPane tab="Estados" key="courseStates">
                                    <States courseId={id} />
                                </Tabs.TabPane>
                            )}
                            <Tabs.TabPane tab="Biblioteca" key="libraries">
                                <Libraries courseId={id}  />
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="Módulos" key="modules">
                                <Modules courseScopeId={courseScopeId} courseId={id} />
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="Contratos" key="contracts">
                                <Contracts courseId={id} />
                            </Tabs.TabPane>
                        </Tabs>
                    </Card>
                </Spin>
            </Form>
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
