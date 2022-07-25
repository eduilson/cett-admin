import React from 'react'

import {
  Form,
  Input,
  Collapse,
  Divider,
  Button,
  Switch,
  FormInstance
} from 'antd'

import {
  DeleteOutlined
} from '@ant-design/icons'

import Upload from "@/components/Upload"

type Props = {
  form: FormInstance<any>
}

const Sliders = ({ form }: Props) => {

  const getField = (field: any, name: any) => {
    return form.getFieldValue([
      'sliders',
      field.name,
      name
    ])
  }

  return(
    <Form.List name="sliders">
      {(fields, {add, remove}) => (
        <React.Fragment>
          {fields.length > 0 && (
            <Collapse accordion>
              {fields.map(field => {
                const header = getField(field, 'title');

                return (
                  <Collapse.Panel
                    header={ header ? header : `Slider #${field.key + 1}` }
                    key={field.key}
                    extra={[<DeleteOutlined onClick={() => remove(field.name)} key='remove' />]}>
                    <Form.Item
                      label='Título'
                      fieldKey={[field.key, 'title']}
                      name={[field.name, 'title']}>
                      <Input size='large' />
                    </Form.Item>
                    <Form.Item
                      label='Texto'
                      fieldKey={[field.fieldKey, 'text']}
                      name={[field.name, 'text']}>
                      <Input.TextArea rows={3} size='large' />
                    </Form.Item>
                    <Form.Item
                      label='Imagem'
                      fieldKey={[field.fieldKey, 'image']}
                      name={[field.name, 'image']}>
                      <Upload accept='image/*' />
                    </Form.Item>
                    <Form.Item
                      label='Link'
                      fieldKey={[field.fieldKey, 'link']}
                      name={[field.name, 'link']}>
                      <Input size='large' />
                    </Form.Item>
                    <Form.Item
                      label='Botão'
                      extra='Texto do botão'
                      fieldKey={[field.fieldKey, 'link_title']}
                      name={[field.name, 'link_title']}>
                      <Input size='large' />
                    </Form.Item>
                    <Form.Item
                      label='Status'
                      initialValue={true}
                      fieldKey={[field.fieldKey, 'status']}
                      name={[field.name, 'status']}
                      valuePropName='checked'>
                      <Switch checkedChildren='Ativo' unCheckedChildren='Inativo'/>
                    </Form.Item>
                  </Collapse.Panel>
                )
              })}
            </Collapse>
          )}

          {fields.length > 0 && <Divider />}

          <Button onClick={() => add()}>Novo slider</Button>
        </React.Fragment>
      )}
    </Form.List>
  )
}

export default Sliders
