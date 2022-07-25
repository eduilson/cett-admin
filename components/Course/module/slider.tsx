import React from 'react'

import {
    Form,
    Input,
    Switch
} from 'antd'

import Wysiwyg from '@/components/Wysiwyg'
import Upload from '@/components/Upload'
import {FormListFieldData} from "antd/es/form/FormList";

type Props = {
    field: FormListFieldData
}

const Slider = ({field}: Props) => (
    <React.Fragment>
        <Form.Item
            label='Título'
            name={[field.name, 'title']}
            fieldKey={[field.fieldKey, 'title']}
            rules={[{required: true, message: 'Esse campo é obrigatório'}]}>
            <Input size="large"/>
        </Form.Item>
        <Form.Item
            label='Conteúdo'
            name={[field.name, 'content']}
            fieldKey={[field.fieldKey, 'content']}>
            <Wysiwyg/>
        </Form.Item>
        <Form.Item
            label='Vídeo Url'
            name={[field.name, 'video_url']}
            fieldKey={[field.fieldKey, 'video_url']}>
            <Input size="large"/>
        </Form.Item>
        <Form.Item
            label='Cronômetro'
            extra="Tempo mínimo (em segundos) de visualização do slider"
            name={[field.name, 'time']}
            fieldKey={[field.fieldKey, 'time']}>
            <Input size="large"/>
        </Form.Item>
        <Form.Item
            label='Áudio'
            name={[field.name, 'audio']}
            fieldKey={[field.fieldKey, 'audio']}>
            <Upload accept=".mp3,audio/*" size="large"/>
        </Form.Item>
        <Form.Item
            label='Status'
            valuePropName="checked"
            name={[field.name, 'status']}
            fieldKey={[field.fieldKey, 'status']}>
            <Switch defaultChecked/>
        </Form.Item>
    </React.Fragment>
)

export default Slider
