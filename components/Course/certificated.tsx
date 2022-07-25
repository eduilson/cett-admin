import React from 'react'

import {
  Form,
  Switch,
  Row,
  Col,
  Table,
  Divider,
  Tag
} from 'antd'

import Wysiwyg from "../Wysiwyg";

const Certificated = () => {

  const TagColumn = (code: string) => <Tag color="geekblue">{code}</Tag>

  const columns = [
    {
      title: "Descrição",
      key: "description",
      dataIndex: "description"
    },
    {
      title: "Código",
      key: "code",
      dataIndex: "code",
      render: TagColumn
    },
  ]

  return(
    <React.Fragment>
      <Form.Item
        name='has_certificate'
        label='Têm certificado?'
        valuePropName="checked">
        <Switch checkedChildren='Sim' unCheckedChildren='Não' />
      </Form.Item>
      <Form.Item
        name='certificate_block'
        label='Bloqueio de certificado'
        extra='Aluno só emite o certificado se atingir a nota mínima da avaliação'
        valuePropName="checked">
        <Switch checkedChildren='Sim' unCheckedChildren='Não' />
      </Form.Item>
      <Form.Item
        name='certificate'
        label='Certificado'>
        <Wysiwyg />
      </Form.Item>
      <Row>
        <Col lg={{offset: 4, span: 16}}>
          <Divider orientation="left">Variáveis</Divider>
          <Table
            size="small"
            columns={columns}
            dataSource={[
              { key: 1, description: "Nome do aluno", code: "{{ nome }}" },
              { key: 2, description: "Cpf do aluno", code: "{{ cpf }}" },
              { key: 3, description: "Renach", code: "{{ renach }}" },
              { key: 4, description: "Data de nascimento", code: "{{ nascimento }}" },
              { key: 5, description: "Estado UF (Ex: RJ)", code: "{{ uf }}" },
              { key: 6, description: "Estado (Ex: Rio de Janeito)", code: "{{ estado }}" },
              { key: 7, description: "Data de inicio", code: "{{ inicio }}" },
              { key: 8, description: "Data de conclusão", code: "{{ conclusao }}" },
              { key: 9, description: "Nota Final", code: "{{ nota_final }}" },
              { key: 10, description: "Cnh", code: "{{ cnh }}" },
              { key: 11, description: "Validade da CNH", code: "{{ cnh_validade }}" },
              { key: 12, description: "RG", code: "{{ rg }}" },
              { key: 13, description: "Telefone", code: "{{ telefone }}" },
              { key: 14, description: "E-mail", code: "{{ email }}" },
            ]}
          />
        </Col>
      </Row>
    </React.Fragment>
  )
}

export default Certificated
