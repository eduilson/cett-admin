import React from 'react'

import {
    Form,
    FormInstance,
    Input, notification, Spin,
    Switch,
    Transfer
} from "antd";
import Request from "@/utils/request";
import Router from "next/router";
import GlobalContext from "@/utils/globalContext";

const layout = {
    labelCol: {span: 4},
    wrapperCol: {span: 16},
};

type Props = {
    form: FormInstance
    id: number
    enableAdmin: (enable: boolean) => void
}

const General = (props: Props) => {

    const { form, id, enableAdmin } = props

    const globalContext = React.useContext(GlobalContext)
    const user = globalContext.user.get

    const [permissions, setPermissions] = React.useState([])
    const [targetKeys, setTargetKeys] = React.useState<string[]>([]);
    const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        if(user) {
            fetchData()
        }
    }, [user])

    const fetchData = async () => {
        setLoading(true)
        try {
            let permissions = (await Request(user.jwt.access_token).get('admin/permissions'))?.data
            setPermissions(permissions)

            let role = (await Request(user.jwt.access_token).get(`admin/roles/${id}`))?.data
            enableAdmin(role.enable_admin)
            form.setFieldsValue(role)
            //setSelectedKeys(permissions.filter(i => !role.permissions.some(l => i.id === l.id)).map(i => i.id))
            setTargetKeys(permissions.filter((i: any) => role.permissions.some((l: any) => i.id === l.id)).map((i: any) => i.id))
        } catch (err) {
            console.log(err)
        }
        setLoading(false)
    }

    const onFinish = async (values: any) => {
        setLoading(true)

        try {
            await Request(user.jwt.access_token).put(`admin/roles/${id}`, {...values, permissions: targetKeys})
            sessionStorage.removeItem('menu')
            notification['success']({
                message: 'Registro salvo com sucesso.'
            })
            await Router.push('/roles')
        } catch (err) {
            notification['error']({
                message: 'Não foi possível salvar o registro'
            });
        }

        setLoading(false)
    }

    return (
        <Spin spinning={loading}>
            <Form
                form={form}
                {...layout}
                name="menu-form"
                onFinish={onFinish}
                autoComplete="off">
                <Form.Item
                    label="Nome"
                    name="name"
                    rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                    <Input size='large'/>
                </Form.Item>
                <Form.Item
                    label="Descrição"
                    name="description">
                    <Input.TextArea size='large'/>
                </Form.Item>
                <Form.Item
                    label="Acesso admin"
                    name="enable_admin"
                    valuePropName="checked">
                    <Switch onChange={enableAdmin} />
                </Form.Item>
                <Form.Item
                    label="Permissões">
                    <Transfer
                        listStyle={{width: '50%', height: 400, minHeight: '200px'}}
                        dataSource={permissions.map((i: any) => ({...i, key: i.id}))}
                        titles={['Permissões', 'Permissões do Grupo']}
                        targetKeys={targetKeys}
                        selectedKeys={selectedKeys}
                        onChange={(nextTargetKeys) => {
                            setTargetKeys(nextTargetKeys);
                        }}
                        onSelectChange={(sourceSelectedKeys, targetSelectedKeys) => {
                            setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
                        }}
                        render={item => item.name}
                    />
                </Form.Item>
            </Form>
        </Spin>
    )
}

export default General
