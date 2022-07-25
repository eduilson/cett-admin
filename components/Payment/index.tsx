import React from 'react'
import {Card, FormInstance} from 'antd';

import CreditCard from "./card"
import Boleto from "./boleto"
import Pix from "./pix"

const tabList = [
  {
    key: 'credit_card',
    tab: 'Cartão de crédito',
  },
  {
    key: 'boleto',
    tab: 'Boleto',
  },
  {
    key: 'pix',
    tab: 'PIX',
  },
];

type Props = {
  form: FormInstance
}

const Payment = (props: Props) => {

  const [key, setKey] = React.useState('credit_card')

  const contentList: any = {
    credit_card: <CreditCard {...props} />,
    boleto: <Boleto {...props} />,
    pix: <Pix {...props} />,
  };

  return(
    <Card
      title="Pagamento"
      tabList={tabList}
      activeTabKey={key}
      onTabChange={key => {
        props.form.setFieldsValue({
          payment_method: key
        })
        setKey(key)
      }}>
      {contentList[key]}
    </Card>
  )
}

export default Payment
