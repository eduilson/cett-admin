import React from 'react'

import {
  Table,
  TablePaginationConfig,
  Button,
  Space,
  Popconfirm,
} from 'antd'

import {
  PlusOutlined,
  EditOutlined, DeleteOutlined,
} from '@ant-design/icons'

import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";

import {
  Contract as ContractT
} from "@/types"

import parseFilters from "@/utils/parseFilters";
import {ColumnsType} from "antd/lib/table";

import Contract from "@/components/Course/contract";

type Props = {
  courseId: number,
}

const Contracts = (props: Props) => {

  const {
    courseId,
  } = props

  const globalContext = React.useContext(GlobalContext)
  const user = globalContext.user.get

  const [loading, setLoading] = React.useState(false);
  const [contractId, setContractId] = React.useState<number>();
  const [showForm, setShowForm] = React.useState<boolean>(false);
  const [rows, setRows] = React.useState<ContractT[]>([])
  const [pagination, setPagination] = React.useState({})

  React.useEffect(() => {
    fetchData(pagination, {})
  }, [])

  React.useEffect(() => {
    if(contractId) setShowForm(true)
  }, [contractId])

  React.useEffect(() => {
    if(!showForm) {
      setContractId(undefined)
      fetchData(pagination, {})
    }
  }, [showForm])

  const fetchData = async (pagination: TablePaginationConfig, filters: {}) => {
    setLoading(true)
    try {
      filters = parseFilters(filters)
      const url = `admin/contracts?page=${pagination.current || 1}&course_id=${courseId}&${filters}`
      const {data, total, per_page, current_page} = (await Request(user.jwt.access_token).get(url)).data
      setRows(data.map((row: any) => ({...row, key: row.id})))
      setPagination({current: current_page, pageSize: per_page, total})
    } catch (err) {
    }
    setLoading(false)
  }

  const destroy = async (id: number) => {
    setLoading(true)
    try{
      await Request(user.jwt.access_token).delete(`admin/contracts/${id}`)
      setRows(rows.filter(row => row.id !== id))
    }catch (err){}
    setLoading(false)
  }

  const ActionsColumn = (contract: ContractT) => (
      <Space>
        <Button
            size="small"
            icon={<EditOutlined />}
            type="primary"
            onClick={() => setContractId(contract.id)} />

        <Popconfirm
            placement="bottomRight"
            okText="Excluir"
            cancelText="Cancelar"
            title="Têm certeza que deseja excluir permanentemente esse registro?"
            onConfirm={() => destroy(contract.id)}>
          <Button size="small" icon={<DeleteOutlined />} type="primary" danger />
        </Popconfirm>
      </Space>
  )

  const columns: ColumnsType<any> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
    },
    {
      key: 'actions',
      align: "right",
      render: ActionsColumn
    },
  ]

  return (
      <React.Fragment>

        <Contract
            onClose={() => setShowForm(false)}
            contractId={contractId}
            courseId={courseId}
            visible={showForm} />

        <Table
            size="small"
            bordered
            rowKey="id"
            pagination={pagination}
            loading={loading}
            columns={columns}
            dataSource={rows}
            onChange={fetchData} />

        <Space style={{width: "100%", justifyContent: "flex-end", marginTop: 16}}>
          <Button
              onClick={() => setShowForm(true)}
              danger type="text"
              icon={<PlusOutlined />}>Novo registro</Button>
        </Space>
      </React.Fragment>
  )
}

export default Contracts
