import React from 'react'

import {
    Form,
    Switch,
    InputNumber,
} from 'antd'

const Evaluation = () => (
    <React.Fragment>
        <Form.Item
            name='has_course_evaluation'
            label='Habilita avaliação?'
            valuePropName="checked">
            <Switch checkedChildren='Sim' unCheckedChildren='Não'/>
        </Form.Item>
        <Form.Item name='max_time_course_evaluation' label='Tempo máximo' extra='Em minutos'>
            <InputNumber size='large'/>
        </Form.Item>
        <Form.Item name='score_course_evaluation' label='Nota mínima'>
            <InputNumber size='large'/>
        </Form.Item>
        <Form.Item name='course_evaluation_questions_count' label='Quantidade de questões'>
            <InputNumber size='large'/>
        </Form.Item>
    </React.Fragment>
)

export default Evaluation
