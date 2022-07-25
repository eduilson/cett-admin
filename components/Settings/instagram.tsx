import React from "react"

import {
  Form,
  Input,
  Button, notification
} from "antd"

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 12 },
};

import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";

const Instagram = () => {

  const globalContext = React.useContext(GlobalContext)
  const user = globalContext.user.get

  const [form] = Form.useForm()
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    async function fetchData(){
      try {
        const data = (await Request(user.jwt.token).get("options/instagram_token")).data
        form.setFieldsValue(data)
      }catch (err){}
    }

    fetchData()
  }, [user])

  const onFinish = async (values: any) => {
    setLoading(true)
    try{
      await Request(user.jwt.token).put("options/instagram_token", { value: values.instagram_token })
      notification["success"]({
        message: "Registro salvo com sucesso"
      })
    }catch (err){
      notification["error"]({
        message: "Não foi possível salver o registro"
      })
    }
    setLoading(false)
  }

  return(
    <Form {...layout} form={form} onFinish={onFinish}>
      <Form.Item label="Token" name="value">
        <Input.TextArea autoSize size="large" />
      </Form.Item>
      <Form.Item wrapperCol={{lg: {offset: 4}}}>
        <Button htmlType="submit" loading={loading} type="primary" size="large">Salvar</Button>
      </Form.Item>
    </Form>
  )
}

export default Instagram
