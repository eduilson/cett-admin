import React from 'react'
import MaskedInput from 'antd-mask-input'

import {
    Button,
    Form as AntForm,
    Input,
    Select,
    Divider,
    Mentions,
    Spin, notification,
} from 'antd'

import Upload from "@/components/Upload"

import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";

import {
    City,
    Role,
    Account,
    State,
    User,
    CnhCategory
} from "@/types";

const layout = {
    labelCol: {span: 6},
    wrapperCol: {span: 14},
};

type Props = {
    id?: number,
    showAddress?: boolean,
    onSave?: (user: User) => void
}

const Form = React.forwardRef((props: Props, ref) => {

    const {id} = props
    const globalContext = React.useContext(GlobalContext)
    const user = globalContext.user.get

    const [form] = AntForm.useForm()
    const [loading, setLoading] = React.useState(true)
    const [roles, setRoles] = React.useState([])
    const [accounts, setAccounts] = React.useState([])
    const [states, setStates] = React.useState<State[]>([])
    const [cities, setCities] = React.useState<City[]>([])
    const [cnhCategories, setCnhCategories] = React.useState<CnhCategory[]>([])
    const [showAddress, setShowAddress] = React.useState<boolean>(false)

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
                const data: User = (await Request(user.jwt.access_token).get(`admin/users/${id}`)).data
                form.setFieldsValue({...data, roles: data.roles.map(r => r.id)})
                if (data.address) {
                    setShowAddress(true)
                    getCities(data.address.state_id)
                }
            }

            const states: State[] = (await Request().get('states')).data
            setStates(states)

            const cnhCategories: CnhCategory[] = (await Request().get('cnh-categories')).data
            setCnhCategories(cnhCategories)

            if (user.roles.includes(1) || user.roles.includes(8)) {
                const accounts = (await Request(user.jwt.access_token).get('admin/accounts?per_page=999')).data
                const roles = (await Request(user.jwt.access_token).get('admin/roles')).data
                setAccounts(accounts.data)
                if(user.roles.includes(8)) {
                    setRoles(roles.data.filter(({ id }: Role) => id === 2 || id === 3))
                }else{
                    setRoles(roles.data)
                }
            }
        } catch (e) {}
        setLoading(false)
    }

    const validateDate = (fields: string[]) => {
        const values = form.getFieldsValue()
        let validate = true

        fields.forEach(( field ) => {
            if(values[field] && values[field].length > 0 && values[field].match(/\d/g).join("").length !== 8){
                form.setFields([{
                    name: field,
                    errors: [ "Valor inválido" ]
                }])

                validate = false
            }
        })

        if(!validate){
            throw new Error();
        }
    }

    const onFinish = async () => {
        setLoading(true)
        const values = form.getFieldsValue()

        try{
            validateDate(['cnh_expiration', 'birth'])
        }catch (err){
            setLoading(false)
            return;
        }

        try {
            let response: User
            if (id) {
                response = (await Request(user.jwt.access_token).put(`admin/users/${id}`, values)).data
            } else {
                response = (await Request(user.jwt.access_token).post(`admin/users`, values)).data
            }
            props.onSave && props.onSave(response)
        }catch (e){
            const errors = e.response.data?.errors || {}
            const keys = Object.keys(errors)
            notification['error']({
                placement: "topLeft",
                message: keys.length ? errors[keys[0]][0] : "Não foi possível salvar o usuário"
            })
        }
        setLoading(false)
    }

    const getCities = async (state_id: number): Promise<City[]> => {
        try {
            const response: State = (await Request(null).get(`states/${state_id}`)).data
            const cities = response?.cities || []
            setCities(cities)
            return cities
        } catch (e) {
        }
        return []
    }

    const viaCep = async (cep: string) => {
        cep = cep.replace(/\D/g, "")

        if (cep.length < 8)
            return false

        const {data} = await Request(null, "https://viacep.com.br/ws/").get(`${cep}/json`)
        const state = states.filter(state => state.abbreviation === data.uf)[0]

        const cities = await getCities(state.id)

        let values: any = {
            address: {
                state_id: state.id
            }
        }

        let city = cities.filter(city => city.name === data.localidade)

        if (city.length > 0) {
            values.address.city_id = city[0].id
        }

        if (data.logradouro !== '') {
            values.address.address = data.logradouro
        }

        if (data.bairro !== '') {
            values.address.neighborhood = data.bairro
        }

        form.setFieldsValue(values)
    }

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
                    label="Nome"
                    name="name"
                    rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                    <Input size='large'/>
                </AntForm.Item>

                {(Array.isArray(user?.roles) && (user.roles.includes(1) || user.roles.includes(8))) && (
                    <React.Fragment>
                        <AntForm.Item
                            label="Funções"
                            name="roles"
                            rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                            <Select mode="multiple" size='large'>
                                {roles.map((role: Role) => (
                                    <Select.Option key={role.id} value={role.id}>{role.name}</Select.Option>
                                ))}
                            </Select>
                        </AntForm.Item>
                        <AntForm.Item
                            label="Auto escola"
                            name="account_id">
                            <Select size='large' allowClear>
                                <Select.Option key={0} value=''>Nenhum</Select.Option>
                                {accounts.map((account: Account) => (
                                    <Select.Option
                                        key={account.id}
                                        value={account.id}>
                                        {account.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </AntForm.Item>
                    </React.Fragment>
                )}

                <AntForm.Item
                    label="E-mail"
                    name="email"
                    rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                    <Input type='email' size='large'/>
                </AntForm.Item>

                <AntForm.Item
                    label="Telefone"
                    name="phone"
                    rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                    <MaskedInput mask='(11) 11111-1111' size='large'/>
                </AntForm.Item>

                <AntForm.Item
                    label="Senha"
                    name="password">
                    <Input size='large' placeholder='Deixe em branco se não quiser alterar'/>
                </AntForm.Item>

                <AntForm.Item
                    label="CPF"
                    name="cpf"
                    rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                    <MaskedInput mask="111.111.111-11" size="large"/>
                </AntForm.Item>

                <AntForm.Item
                    label="RG"
                    name="rg">
                    <Input size="large" />
                </AntForm.Item>

                <AntForm.Item
                    label="Sexo"
                    name="gender">
                    <Select
                        size="large"
                        options={[
                            { value: "male", label: "Masculino" },
                            { value: "female", label: "Feminino" },
                        ]} />
                </AntForm.Item>

                <AntForm.Item
                    label="CNH"
                    name="cnh">
                    <Input size="large" />
                </AntForm.Item>

                <AntForm.Item
                    label="Validade CNH"
                    name="cnh_expiration">
                    <MaskedInput mask="11/11/1111" size="large" />
                </AntForm.Item>

                <AntForm.Item
                    label="Categoria CNH"
                    name="cnh_category_id">
                    <Select
                        size="large"
                        options={cnhCategories.map(({id, name}) => ({ value: id, label: name }))} />
                </AntForm.Item>

                <AntForm.Item
                    label="Renach"
                    name="renach">
                    <Input size="large" />
                </AntForm.Item>

                <AntForm.Item
                    label="Data de nascimento"
                    name="birth">
                    <MaskedInput mask="11/11/1111" size="large" />
                </AntForm.Item>

                <AntForm.Item
                    label="Descrição"
                    name="description">
                    <Mentions rows={3}/>
                </AntForm.Item>

                <AntForm.Item
                    label="Avatar"
                    name="avatar">
                    <Upload/>
                </AntForm.Item>

                <AntForm.Item wrapperCol={{offset: 4, span: 16}}>
                    <Divider orientation='center'>Endereço</Divider>
                </AntForm.Item>

                {(showAddress || props.showAddress) ? (
                    <React.Fragment>
                        <AntForm.Item
                            label='CEP'
                            name={['address', 'postal_code']}
                            rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                            <MaskedInput
                                onChange={elem => viaCep(elem.target.value)}
                                mask="11.111-111" size="large"/>
                        </AntForm.Item>
                        <AntForm.Item
                            label='Estado'
                            name={['address', 'state_id']}
                            rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                            <Select
                                showSearch
                                onChange={async value => {
                                    try {
                                        const response = (await Request().get(`states/${value}`)).data
                                        setCities(response.cities)
                                    } catch (e) {
                                    }
                                }}
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                size='large'>
                                {states.map(state => (
                                    <Select.Option
                                        key={state.id}
                                        value={state.id}>
                                        {state.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </AntForm.Item>
                        <AntForm.Item
                            label='Cidade'
                            name={['address', 'city_id']}
                            rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                            <Select
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                size='large'>
                                {cities.map(city => (
                                    <Select.Option key={city.id} value={city.id}>{city.name}</Select.Option>
                                ))}
                            </Select>
                        </AntForm.Item>
                        <AntForm.Item
                            label='Bairro'
                            name={['address', 'neighborhood']}
                            rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                            <Input size="large" />
                        </AntForm.Item>
                        <AntForm.Item
                            label='Endereço'
                            name={['address', 'address']}
                            rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                            <Input size="large" />
                        </AntForm.Item>
                        <AntForm.Item
                            label='Número'
                            name={['address', 'street_number']}
                            rules={[{required: true, message: 'Esse campo é obrigatório!'}]}>
                            <Input size="large" />
                        </AntForm.Item>
                        <AntForm.Item
                            label='Complemento'
                            name={['address', 'description']}>
                            <Input size="large" />
                        </AntForm.Item>
                    </React.Fragment>
                ) : (
                    <AntForm.Item wrapperCol={{offset: 4}}>
                        <Button onClick={() => setShowAddress(!showAddress)} type='primary'>
                            Adicionar endereço
                        </Button>
                    </AntForm.Item>
                )}
            </AntForm>
        </Spin>
    )
})

Form.displayName = 'Form'

export default Form

export type FormRef = {
    submit: () => void,
    reset: () => void,
}
