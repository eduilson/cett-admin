import React, {ChangeEventHandler} from 'react'
import MaskedInput from 'antd-mask-input'

import {
  Input,
  Space,
  Button,
  DatePicker,
} from 'antd'

import {
  SearchOutlined
} from '@ant-design/icons'
import {FilterDropdownProps} from "antd/lib/table/interface";

type CustomInputProps = {
  placeholder?: any,
  onChange?: ChangeEventHandler<HTMLInputElement>,
  value?: any,
  mask?: string,
  format?: string[]|string,
  type?: string,
  picker?: string,
}

const getColumnSearchProps = (dataIndex: any, config?: CustomInputProps): object => {

  const defaultConfig = {
    mask: '',
    type: 'text',
  }

  config = {...defaultConfig, ...config}

  let InputComponent: any;

  if(config?.type === 'date_ranger'){
    InputComponent = DatePicker.RangePicker
  }else{
    InputComponent = config?.mask ? MaskedInput : Input
  }

  const inputProps = (setSelectedKeys: Function, selectedKeys: Array<any>): CustomInputProps =>  {

    let inputProps: CustomInputProps = {
      placeholder: `Search ${dataIndex}`,
      onChange: (e: any) => setSelectedKeys(e.target.value ? [e.target.value] : []),
      value: selectedKeys[0],
      mask: ''
    }

    if(config?.mask && config?.mask !== ''){
      inputProps.mask = config.mask
    }else if(config?.type === 'date_ranger'){
      inputProps.placeholder = ["Início", "Fim"]
      inputProps.format = ["DD/MM/YYYY", "DD/MM/YYYY"]
      inputProps.onChange = (moment: any) => {
        if(Array.isArray(moment)) {
          const ranger = moment.map((d: any) => d.format('YYYY-MM-DD'))
          setSelectedKeys([ranger])
        }else{
          setSelectedKeys([])
        }
      }

      delete inputProps.value
    }

    if(config?.placeholder){
      inputProps.placeholder = config.placeholder
    }

    return inputProps
  }

  return {
    filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters}: FilterDropdownProps) => (
        <div style={{padding: 8}}>
          <InputComponent
              {...inputProps(setSelectedKeys, selectedKeys)}
              size='large'
              onPressEnter={confirm}
              style={{width: 200, marginBottom: 8, display: 'flex'}}
          />
          <Space>
            <Button
                type="primary"
                onClick={() => confirm()}
                icon={<SearchOutlined/>}
                size="small"
                style={{width: 90}}>
              Search
            </Button>
            <Button onClick={() => {
              clearFilters && clearFilters()
              setSelectedKeys([])
            }} size="small" style={{width: 90}}>
              Reset
            </Button>
          </Space>
        </div>
    ),
    filterIcon: (filtered: boolean) => <SearchOutlined style={{color: filtered ? '#1890ff' : undefined}}/>
  }
}

export default getColumnSearchProps
