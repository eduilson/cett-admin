import React from 'react'

import {
    Form,
} from 'antd'

import Upload from "../Upload";

const Banners = () => (
    <React.Fragment>
        <Form.Item
            name='thumbnail'
            label='Thumbnail'
            extra='Imagem a ser exibida na listagem de cursos'>
            <Upload accept='image/*'/>
        </Form.Item>
        <Form.Item
            name='image'
            label='Imagem'
            extra='Imagem a ser exibida na página do curso'>
            <Upload accept='image/*'/>
        </Form.Item>
    </React.Fragment>
)

export default Banners
