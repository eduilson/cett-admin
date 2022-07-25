import React from 'react'

import {
    Button,
    Drawer,
    Space,
} from 'antd'

type Props = {
    onClose: () => void,
    visible: boolean,
    id?: number,
    onSave?: (user: User) => void
}

import Form, { FormRef } from "./form"
import {User} from "@/types";

const Modal = (props: Props) => {

    const {onClose, visible} = props

    const formRef = React.useRef<FormRef>()
    const [id, setId] = React.useState<number>()

    React.useEffect(() => {
        if(visible){
            setId(props.id)
        }else{
            setId(undefined)
        }
    }, [visible])

    const closeDrawer = () => {
        formRef.current?.reset()
        onClose()
    }

    const onSave = (user: User) => {
        props.onSave && props.onSave(user)
        onClose()
    }

    return (
        <Drawer
            onClose={closeDrawer}
            title={id ? 'Editar usuário' : 'Novo usuário'}
            visible={visible}
            width="50vw"
            footer={
                <Space style={{width: "100%", justifyContent: "flex-end"}}>
                    <Button type="primary" onClick={() => formRef.current?.submit()}>Salvar</Button>
                    <Button type="primary" danger onClick={closeDrawer}>Cancelar</Button>
                </Space>
            }>
            <Form
                ref={formRef}
                onSave={onSave}
                showAddress={true}
                id={id} />
        </Drawer>
    )
}

export default Modal
