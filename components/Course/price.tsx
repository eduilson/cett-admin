import React from 'react'

import {
    Form,
    InputNumber,
    DatePicker
} from 'antd'

const Price = () => (
    <React.Fragment>
        <Form.Item name='price' label='Preço'>
            <InputNumber/>
        </Form.Item>
        <Form.Item
            name='special_price'
            label='Preço promocional'
            extra='Aplicado apenas em cursos com escopo "Nacional"'>
            <InputNumber size='large'/>
        </Form.Item>
        <Form.Item
            name='special_price_start'
            label='Data de início'
            extra='Data de início da promoção'>
            <DatePicker size='large' format='DD/MM/YYYY'/>
        </Form.Item>
        <Form.Item
            name='special_price_end'
            label='Data final'
            extra='Data final da promoção'>
            <DatePicker size='large' format='DD/MM/YYYY'/>
        </Form.Item>
    </React.Fragment>
)


export default Price
