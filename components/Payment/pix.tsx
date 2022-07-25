import React from "react"

import {
  Alert,
  Button, FormInstance,
} from "antd";

type Props = {
  form: FormInstance
}

const Pix = ({ form }: Props) => {

  const amount = form.getFieldValue('amount')

  if(!amount) return (
    <Alert
      message="Nenhum curso selecionado"
      description="Selecione um curso para dá início ao processo de pagamento."
      type="warning"
      showIcon
    />
  )

  return (
    <React.Fragment>
      <Button size="large" type="primary" onClick={form.submit}>Processar</Button>
    </React.Fragment>
  )

}

export default Pix
