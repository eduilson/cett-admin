import React, {ReactNode} from 'react'

import {
    Form,
    Collapse,
    Button,
    Input, FormInstance, Spin, notification
} from "antd";
import {DeleteOutlined, PlusOutlined} from "@ant-design/icons";
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";

const layout = {
    labelCol: {span: 4},
    wrapperCol: {span: 16},
};

type Props = {
    form: FormInstance
    id: number
}

const children = (form: FormInstance, name: number) => {

    const genExtra = (remove: any, key: number): ReactNode => (
        <DeleteOutlined
            onClick={event => {
                remove(key)
                event.stopPropagation();
            }}/>
    )

    return(
        <Form.List name={[name, 'children']}>
            { (fields, {add, remove}) => (
                <React.Fragment>
                    { fields.length > 0 && (
                        <Collapse style={{marginBottom: 32}}>
                            { fields.map((field, index) => {
                                const item = form.getFieldValue(['menu_items', name, 'children', field.name])

                                return(
                                    <Collapse.Panel key={index} header={item?.title || `#${index + 1}`} extra={genExtra(remove, field.key)}>
                                        <Form.Item
                                            {...layout}
                                            label="Título"
                                            name={[ field.name, 'title']}
                                            rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                                            <Input size="large" />
                                        </Form.Item>
                                        <Form.Item
                                            {...layout}
                                            label="Url"
                                            name={[ field.name, 'path']}
                                            rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                                            <Input size="large" />
                                        </Form.Item>
                                    </Collapse.Panel>
                                )
                            }) }
                        </Collapse>
                    ) }
                    <Button type="primary" icon={<PlusOutlined />} onClick={add} />
                </React.Fragment>
            ) }
        </Form.List>
    )
}

const Menu = ({form, id}: Props) => {

    const globalContext = React.useContext(GlobalContext)
    const user = globalContext.user.get
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        getMenu()
    }, [])

    const getMenu = async () => {
        setLoading(true)
        try{
            const response = (await Request(user.jwt.access_token).get(`admin/admin-menus?role_id=${id}`)).data
            form.setFieldsValue({ menu_items: response })
        }catch (err){}
        setLoading(false)
    }

    const genExtra = (remove: any, key: number): ReactNode => (
        <DeleteOutlined
            onClick={event => {
                remove(key)
                event.stopPropagation();
            }}/>
    )

    const onFinish = async (values: any) => {
        setLoading(true)
        try{
            (await Request(user.jwt.access_token).post('admin/admin-menus', {
                ...values,
                role_id: id,
            }))
            notification['success']({
                message: 'Registro atualizado com sucesso.'
            })
            sessionStorage.removeItem('admin_menus')
        }catch (err){
            notification['error']({
                message: 'Não foi possível salvar o registro. Por favor, tente novamrnte mais tarde.'
            })
        }
        console.log({...values, id: 2})
        setLoading(false)
    }

    return(
        <Spin spinning={loading}>
            <Form {...layout} form={form} onFinish={onFinish}>
                <Form.Item label="Itens">
                    <Form.List name="menu_items">
                        {(fields, {add, remove}) => (
                            <React.Fragment>
                                { fields.length > 0 && (
                                    <Collapse style={{marginBottom: 32}}>
                                        { fields.map((field, index) => {
                                            const item = form.getFieldValue(['menu_items', field.name])

                                            return (
                                                <Collapse.Panel
                                                    key={index}
                                                    header={item?.title || `#${index + 1}`}
                                                    extra={genExtra(remove, field.key)}>
                                                    <Form.Item
                                                        {...layout}
                                                        label="Título"
                                                        name={[field.name, 'title']}
                                                        rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                                                        <Input size="large" />
                                                    </Form.Item>
                                                    <Form.Item {...layout} label="Subitens">
                                                        { children(form, field.name) }
                                                    </Form.Item>
                                                </Collapse.Panel>
                                            )
                                        }) }
                                    </Collapse>
                                ) }
                                <Button icon={<PlusOutlined />} onClick={add}>Adicionar menu</Button>
                            </React.Fragment>
                        )}
                    </Form.List>
                </Form.Item>
            </Form>
        </Spin>
    )

}

export default Menu
