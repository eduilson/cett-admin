import React from "react"
import MaskedInput from "antd-mask-input";

import {
    Button,
    Form,
    Input,
    Select,
    Spin,
    Alert, FormInstance
} from "antd";

const layout = {
    labelCol: {span: 6},
    wrapperCol: {span: 8},
};

import Request from "@/utils/request";
import GlobalContext from "@/utils/globalContext";

type Props = {
    form: FormInstance
}

const Card = ({form}: Props) => {

    const globalContext = React.useContext(GlobalContext)
    const user = globalContext.user.get
    const amount = form.getFieldValue('amount')

    const [spinning, setSpinning] = React.useState(false)
    const [installments, setInstallments] = React.useState<any>({})

    React.useEffect(() => {
        getInstallments()
    }, [amount])

    const getInstallments = async () => {
        setSpinning(true)
        try {
            const response = (await Request(user.jwt.access_token).post("order/installments", {amount})).data
            setInstallments(response)
        } catch (err) {
        }
        setSpinning(false)
    }

    if (!amount) return (
        <Alert
            message="Nenhum curso selecionado"
            description="Selecione um curso para dá início ao processo de pagamento."
            type="warning"
            showIcon
        />
    )

    const currency = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    })

    return (
        <Spin spinning={spinning}>
            <Form.Item
                hidden={true}
                name="brand">
                <Input size="large"/>
            </Form.Item>
            <Form.Item
                {...layout}
                label="Número do cartão"
                name="card_number"
                rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                <MaskedInput mask="1111 1111 1111 1111" size="large"/>
            </Form.Item>
            <Form.Item
                {...layout}
                label="Data de validade"
                name="card_expiration_date"
                rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                <MaskedInput mask="11/11" size="large"/>
            </Form.Item>
            <Form.Item
                {...layout}
                label="CVV"
                name="card_cvv"
                rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                <MaskedInput mask="111" size="large"/>
            </Form.Item>
            <Form.Item
                {...layout}
                label="Nome impresso"
                name="card_holder_name"
                rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                <Input size="large"/>
            </Form.Item>
            <Form.Item
                {...layout}
                label="Parcelas"
                name="installments"
                rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                <Select size="large">
                    {Object.keys(installments).map((key: any) => (
                        <Select.Option value={installments[key].installment} key={key}>
                            {installments[key].installment} x {currency.format(installments[key].installment_amount)}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item
                hidden
                name="installment_amount">
                <Input />
            </Form.Item>
            <Form.Item wrapperCol={{offset: 6}}>
                <Button size="large" type="primary" onClick={form.submit}>Processar</Button>
            </Form.Item>
        </Spin>
    )
}

export default Card
