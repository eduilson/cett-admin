import React from 'react'

import {
    Form,
    Input,
    Mentions,
    Switch,
    Select,
    InputNumber
} from 'antd'

import Upload from "@/components/Upload"
import Wysiwyg from "@/components/Wysiwyg"

import {
    CourseCategory,
    CourseCode,
    CourseScope
} from "@/types";

type Props = {
    courseScopes: CourseScope[],
    courseCodes: CourseCode[],
    courseCategories: CourseCategory[],
    setCourseScope: Function
}

const General = (props: Props) => {

    const {
        courseScopes,
        courseCodes,
        setCourseScope,
        courseCategories,
    } = props

    return (
        <React.Fragment>
            <Form.Item
                name='course_code_id'
                label='Código do curso'>
                <Select
                    size='large'
                    options={courseCodes.map(({id, name}) => ({ label: name, value: id }))} />
            </Form.Item>
            <Form.Item
                name='course_scope_id'
                label='Escopo'
                rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                <Select
                    size='large'
                    options={courseScopes.map(({ id, name }) => ({ label: name, value: id }))}
                    onChange={value => setCourseScope(value)} />
            </Form.Item>
            <Form.Item
                name='course_category_id'
                label='Categoria'>
                <Select
                    allowClear
                    size='large'
                    options={courseCategories.map(({ id, name }) => ({ label: name, value: id }))} />
            </Form.Item>
            <Form.Item
                name='name'
                label='Nome do curso'
                rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                <Input size='large'/>
            </Form.Item>
            <Form.Item
                name='max_time'
                label='Tempo máximo'
                extra='Tempo máximo diário de estudo por aluno em horas'
                rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                <InputNumber size='large'/>
            </Form.Item>
            <Form.Item
                name='completion_time'
                label='Conclusão'
                extra='Tempo máximo de conclusão em dias'>
                <InputNumber size='large'/>
            </Form.Item>
            <Form.Item
                name='workload'
                label='Carga horária'
                extra='Carga horária total do curso em horas'
                rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                <InputNumber size='large'/>
            </Form.Item>
            <Form.Item
                name='student_guide'
                label='Guia do estudante'>
                <Upload />
            </Form.Item>
            <Form.Item
                name='navigability_guide'
                label='Guia de navegabilidade'>
                <Upload />
            </Form.Item>
            <Form.Item
                name='has_certificate'
                label='Têm certificado?'
                valuePropName="checked">
                <Switch checkedChildren='Sim' unCheckedChildren='Não' />
            </Form.Item>
            <Form.Item name='face_recognition' label='Reconhecimento facial' valuePropName="checked">
                <Switch checkedChildren="Ativo" unCheckedChildren="Inativo"/>
            </Form.Item>
            <Form.Item name='excerpt' label='Resumo do curso'>
                <Mentions rows={3}/>
            </Form.Item>
            <Form.Item name='content' label='Descrição'>
                <Wysiwyg />
            </Form.Item>
            <Form.Item name='status' label='Status' valuePropName="checked">
                <Switch checkedChildren="Ativo" unCheckedChildren="Inativo"/>
            </Form.Item>
        </React.Fragment>
    )
}

General.defaultProps = {
    student_guide: [],
    navigability_guide: [],
    course_codes: [],
}

export default General
