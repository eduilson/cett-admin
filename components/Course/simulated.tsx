import React from 'react'

import {
    Form,
    Switch,
    InputNumber,
} from 'antd'

const Simulated = () => (
    <React.Fragment>
        <Form.Item
            name='has_module_evaluation'
            label='Habilita simulados?'
            valuePropName="checked"
            initialValue={1}>
            <Switch checkedChildren='Sim' unCheckedChildren='Não'/>
        </Form.Item>
        <Form.Item name='max_time_module_evaluation' label='Tempo máximo' extra='Em minutos'>
            <InputNumber size='large'/>
        </Form.Item>
        <Form.Item name='score_module_evaluation' label='Nota mínima'>
            <InputNumber size='large'/>
        </Form.Item>
        <Form.Item name='module_evaluation_questions_count' label='Quantidade de questões'>
            <InputNumber size='large'/>
        </Form.Item>
        <Form.Item
            name='is_module_block'
            label='Bloqueia módulos'
            extra='Se o aluno não atingir a pontuação mínima não poderá avançar para o próximo módulo'
            valuePropName="checked"
            initialValue={1}>
            <Switch/>
        </Form.Item>
    </React.Fragment>
)

export default Simulated
