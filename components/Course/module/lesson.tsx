import React from 'react'

import {
    Tabs,
    Form,
    Input,
    InputNumber,
    Switch,
    Collapse,
    Button, FormInstance
} from 'antd'

import {
    DeleteOutlined,
    PlusOutlined
} from "@ant-design/icons";

import Slider from './slider'

import {
    FormListFieldData
} from "antd/es/form/FormList";

type Props = {
    lesson: FormListFieldData,
    form: FormInstance,
}

const Lesson = ({lesson, form}: Props) => (
    <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Dados de cadastro" key="general">
            <Form.Item
                name={[lesson.name, 'name']}
                fieldKey={[lesson.fieldKey, 'name']}
                label="Nome"
                rules={[{required: true, message: 'Esse campo é obrigatório'}]}>
                <Input size="large"/>
            </Form.Item>
            <Form.Item
                name={[lesson.name, 'value_time']}
                fieldKey={[lesson.fieldKey, 'value_time']}
                label="Carga horária">
                <InputNumber size="large"/>
            </Form.Item>
            <Form.Item
                name={[lesson.name, 'status']}
                fieldKey={[lesson.fieldKey, 'status']}
                valuePropName="checked"
                label="Ativo">
                <Switch defaultChecked/>
            </Form.Item>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Sliders" key="sliders">
            <Form.List name={[lesson.name, 'sliders']}>
                {(fields, {add, remove}) => (
                    <React.Fragment>
                        {fields.length > 0 && (
                            <Collapse accordion>
                                {fields.map(field => {
                                    const slider = form.getFieldValue(['lessons', lesson.name, 'sliders', field.name])
                                    return (
                                        <Collapse.Panel
                                            header={slider?.title || `Slider #${field.key + 1}`}
                                            key={field.key}
                                            extra={
                                                <DeleteOutlined
                                                    onClick={event => {
                                                        remove(field.name)
                                                        event.stopPropagation()
                                                    }}/>
                                            }>
                                            <Slider field={field}/>
                                        </Collapse.Panel>
                                    )
                                })}
                            </Collapse>
                        )}

                        <Button
                            icon={<PlusOutlined/>}
                            style={{marginTop: fields.length > 0 ? 16 : 0}}
                            size="large"
                            type="default"
                            onClick={() => add()}>Novo slider</Button>
                    </React.Fragment>
                )}
            </Form.List>
        </Tabs.TabPane>
    </Tabs>
)

export default Lesson
