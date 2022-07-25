import React from "react"
import PropTypes from "prop-types"
import Link from "next/link"

import {
  Button,
  Space,
  Table,
  Tooltip,
} from "antd"

import {
  EyeOutlined,
  LineChartOutlined
} from '@ant-design/icons'

import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";
import {ColumnsType} from "antd/lib/table";
import {Order} from "@/types";

type Props = {
  id: number
}

const Orders = ({ id }: Props) => {

  const globalContext = React.useContext(GlobalContext)
  const user = globalContext.user.get
  const [orders, setOrders] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchOrders()
  }, [user])

  const fetchOrders = async () => {
    setLoading(true)
    try{
      const orders = (await Request(user.jwt.token).get(`orders?user_id=${id}`)).data
      setOrders(orders.data)
    }catch (err){}
    setLoading(false)
  }

  const ActionsColumn = (row: Order) => (
    <Space>
      <Link href={`/orders/${row.id}`} passHref>
        <Tooltip title="Dados de cadastro">
          <Button icon={<EyeOutlined />} type="primary" />
        </Tooltip>
      </Link>
      <Link href={`/orders/${row.id}/progress`} passHref>
        <Tooltip title="Progresso">
          <Button icon={<LineChartOutlined />} type="dashed"  />
        </Tooltip>
      </Link>
    </Space>
  )

  const columns: ColumnsType<any> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Curso',
      dataIndex: 'course',
      key: 'course',
      render: course => course.name
    },
    {
      title: 'Status',
      dataIndex: 'order_status',
      key: 'order_status',
      render: order_status => order_status.name
    },
    {
      title: 'Data da matrícula',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      align: "right",
      render: ActionsColumn
    },
  ]

  return(
    <Table
      rowKey="id"
      size="small"
      loading={loading}
      columns={columns}
      dataSource={orders}
    />
  )
}

Orders.propTypes = {
  id: PropTypes.number.isRequired
}

export default Orders
