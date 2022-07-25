import React, {ReactNode} from 'react'
import { listaBancos } from './bank_codes.json'

import {
    Form as AntForm,
    Input,
    Select,
    Divider,
    Spin,
    InputNumber,
    Space,
    Col,
    Tooltip,
    Switch,
    Collapse, Button, notification
} from 'antd'

import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";

import {
    User,
} from "@/types";
import {DeleteOutlined, PlusOutlined} from "@ant-design/icons";

const layout = {
    labelCol: {span: 6},
    wrapperCol: {span: 14},
};

type Props = {
    id?: number,
    showAddress?: boolean,
    onSave?: (user: User) => void
}

const BankAccount =  React.forwardRef((props: Props, ref) => {

    const {id} = props
    const globalContext = React.useContext(GlobalContext)
    const user = globalContext.user.get
    const bankCodes = listaBancos.filter(bank => bank.Compensacao !== '')

    const [form] = AntForm.useForm()
    const [loading, setLoading] = React.useState(true)
    const [transfer_interval, setTransferInterval] = React.useState('monthly')
    const [isPj, setIsPj] = React.useState(false)

    React.useEffect(() => {
        fetchData()
    }, [user, id])

    React.useImperativeHandle(ref, () => ({
        submit: () => form.submit(),
        reset: () => form.resetFields(),
    }), []);

    const fetchData = async () => {
        setLoading(true)
        try {
            if (id) {
                const response: any = (await Request(user.jwt.access_token).get(`admin/recipients/${id}`)).data
                form.setFieldsValue({
                    percentage: response.percentage,
                    ...response.recipient,
                    ...response.recipient.bank_account,
                })
            }

        } catch (e) {}
        setLoading(false)
    }

    const onFinish = async () => {
        setLoading(true)
        const values = form.getFieldsValue()
        try {
            (await Request(user.jwt.access_token).put(`admin/recipients/${id}`, {
                ...values,
                is_pj: isPj ? 1 : 0
            })).data
        }catch (err){
            const errors = err.response.data?.errors || {}
            const keys = Object.keys(errors)
            notification['error']({
                message: keys.length > 0 ? errors[keys[0]][0] : "Não foi possível salvar o registro."
            })
        }
        setLoading(false)
    }

    const genExtra = (remove: any, key: number): ReactNode => (
        <DeleteOutlined
            onClick={event => {
                remove(key)
                event.stopPropagation();
            }}/>
    )

    return (
        <Spin spinning={loading}>
            <AntForm
                onFinishFailed={console.log}
                form={form}
                {...layout}
                scrollToFirstError
                name="user-form"
                onFinish={onFinish}
                autoComplete="off">

                <AntForm.Item
                    label="Banco"
                    name="bank_code"
                    rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                    <Select
                        size="large"
                        showSearch
                        filterOption={(input, option) =>
                            // @ts-ignore
                            option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        options={bankCodes.map(b => ({ value: b.Compensacao, label: `${b.Compensacao} - ${b.banco}`}))} />
                </AntForm.Item>

                <AntForm.Item
                    label="Agência">
                    <Space split="-" align="center" className="bankform__inline">
                        <AntForm.Item
                            noStyle
                            name="agencia"
                            rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                            <InputNumber maxLength={4} size='large' />
                        </AntForm.Item>
                        <Tooltip title="Dígito">
                            <AntForm.Item
                                noStyle
                                name="agencia_dv">
                                <InputNumber maxLength={1} size='large' />
                            </AntForm.Item>
                        </Tooltip>
                    </Space>
                </AntForm.Item>

                <AntForm.Item
                    label="Conta">
                    <Space split="-" align="center" className="bankform__inline">
                        <AntForm.Item
                            name="conta"
                            noStyle
                            rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                            <InputNumber maxLength={13} size='large' />
                        </AntForm.Item>
                        <Tooltip title="Dígito">
                            <AntForm.Item
                                noStyle
                                name="conta_dv"
                                rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                                <InputNumber maxLength={2} size='large' />
                            </AntForm.Item>
                        </Tooltip>
                    </Space>
                </AntForm.Item>

                <AntForm.Item
                    label="Tipo"
                    name="type"
                    initialValue="conta_corrente"
                    rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                    <Select size='large' >
                        <Select.Option value="conta_corrente">Corrente</Select.Option>
                        <Select.Option value="conta_poupanca">Poupança</Select.Option>
                        <Select.Option value="conta_corrente_conjunta">Corrente Conjunta</Select.Option>
                        <Select.Option value="conta_poupanca_conjunta">Poupança Conjunta</Select.Option>
                    </Select>
                </AntForm.Item>

                <AntForm.Item
                    name="is_pj"
                    label="Pessoa"
                    valuePropName="checked">
                    <Switch checkedChildren="PJ" unCheckedChildren="Física" onChange={setIsPj} />
                </AntForm.Item>

                <AntForm.Item
                    name="legal_name"
                    label="Nome titular"
                    extra="Nome/Razão social do dono da conta (Até 30 caractéres)"
                    rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                    <Input size="large" maxLength={30} />
                </AntForm.Item>

                { !isPj && (
                    <AntForm.Item
                        name="email"
                        label="E-mail"
                        rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                        <Input size="large" />
                    </AntForm.Item>
                )}

                <AntForm.Item
                    name="document_number"
                    label={ isPj ? 'CNPJ' : 'CPF' }
                    help="Apenas números"
                    rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                    <Input size="large" />
                </AntForm.Item>

                { isPj && (
                    <React.Fragment>
                        <AntForm.Item
                            name="company_name"
                            label="Nome Fantasia"
                            rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                            <Input size="large" />
                        </AntForm.Item>
                        <AntForm.Item label="Sócios" help="Dados dos sócios listados neste CNPJ.">
                            <AntForm.List name="managing_partners">
                                {(fields, {add, remove}) => (
                                    <React.Fragment>
                                        { fields.length > 0 && (
                                            <Collapse>
                                                { fields.map((field, index) => {
                                                    const partner = form.getFieldValue(['managing_partners', field.name])

                                                    return (
                                                        <Collapse.Panel
                                                            header={partner?.name || `#${index + 1}`}
                                                            key={field.key}
                                                            extra={genExtra(remove, field.key)}>
                                                            <AntForm.Item
                                                                labelCol={{span: 4}}
                                                                wrapperCol={{span: 16}}
                                                                name={[field.name, 'name']}
                                                                label="Nome"
                                                                rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                                                                <Input size="large" />
                                                            </AntForm.Item>
                                                            <AntForm.Item
                                                                labelCol={{span: 4}}
                                                                wrapperCol={{span: 16}}
                                                                name={[field.name, 'document_number']}
                                                                label="CPF"
                                                                help="Apenas números"
                                                                rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                                                                <Input size="large" />
                                                            </AntForm.Item>
                                                            <AntForm.Item
                                                                labelCol={{span: 4}}
                                                                wrapperCol={{span: 16}}
                                                                name={[field.name, "email"]}
                                                                label="E-mail"
                                                                rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                                                                <Input type="email" size="large" />
                                                            </AntForm.Item>
                                                        </Collapse.Panel>
                                                    )
                                                }) }
                                            </Collapse>
                                        ) }
                                        <Button
                                            icon={<PlusOutlined />}
                                            style={{marginTop: fields.length > 0 ? 16 : 0}}
                                            onClick={add}>Adicionar</Button>
                                    </React.Fragment>
                                )}
                            </AntForm.List>
                        </AntForm.Item>
                    </React.Fragment>
                )}

                <Col lg={{offset: 6, span: 14}}>
                    <Divider orientation="left">Pagamentos</Divider>
                </Col>

                <AntForm.Item
                    name="transfer_enabled"
                    label="Pagamento automático"
                    valuePropName="checked"
                    rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                    <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" />
                </AntForm.Item>

                <AntForm.Item
                    name="transfer_interval"
                    label="Frequencia de pagamento"
                    initialValue='monthly'
                    rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                    {/** @ts-ignore */}
                    <Select onChange={setTransferInterval} size="large">
                        <Select.Option value='daily'>Diário</Select.Option>
                        <Select.Option value='weekly'>Semanal</Select.Option>
                        <Select.Option value='monthly'>Mensal</Select.Option>
                    </Select>
                </AntForm.Item>

                { (transfer_interval === 'weekly' || transfer_interval === 'monthly') && (
                    <AntForm.Item
                        name="transfer_day"
                        label="Dia de pagamento"
                        initialValue={1}
                        rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                        <Select size="large">
                            { transfer_interval === 'monthly' ? (
                                <React.Fragment>
                                    { Array.from({length: 31}, (_, i) => i + 1).map(day => (
                                        <Select.Option value={day} key={day}>{day}</Select.Option>
                                    )) }
                                </React.Fragment>
                            ) : (
                                <React.Fragment>
                                    { ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'].map((day, index) => (
                                        <Select.Option value={index + 1} key={index}>{ day }</Select.Option>
                                    )) }
                                </React.Fragment>
                            ) }
                        </Select>
                    </AntForm.Item>
                ) }

                <AntForm.Item
                    name="percentage"
                    label="Comissão por venda"
                    initialValue={0}
                    help="Em porcentagem"
                    rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                    <InputNumber size="large" />
                </AntForm.Item>


            </AntForm>
        </Spin>
    )
})

BankAccount.displayName = 'BankAccount'

export default BankAccount

export type FormRef = {
    submit: () => void,
    reset: () => void,
}
