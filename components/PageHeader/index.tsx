import React from 'react'
import clsx from 'clsx'

import {
    PageHeader as Base,
    Affix,
    PageHeaderProps
} from 'antd'

const PageHeader = (props: PageHeaderProps) => {
  const [sticky, setSticky] = React.useState(false)

  return (
    <Affix onChange={affixed => setSticky(affixed || false)}>
      <Base {...props} className={clsx('page-header', {
        ['page-header--sticky']: sticky
      })} />
    </Affix>
  )
}

export default PageHeader
