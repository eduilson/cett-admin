import React from 'react'

import {
  Form,
  Select,
} from 'antd'

import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";

const Tutors = () => {

  const globalContext = React.useContext(GlobalContext)
  const user = globalContext.user.get

  const [tutors, setTutors] = React.useState([])

  React.useEffect(() => {

    const fetchData = async () => {
      const tutors = (await Request(user.jwt.access_token).get('admin/users?roles=2')).data
      setTutors(tutors.data)
    }

    if(user){
      fetchData()
    }
  }, [user])

  return (
      <Form.Item label="Tutores" name="tutors">
        <Select size="large" mode="multiple" allowClear options={tutors.map(({ id, name }) => ({ value: id, label: name }))} />
      </Form.Item>
  )
}

export default Tutors
