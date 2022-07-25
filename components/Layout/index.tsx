import React from 'react'
import Link from 'next/link'
import Router from "next/router"
import clsx from "clsx";

import {
  Layout as BaseLayout,
  Menu,
  Breadcrumb,
  Badge,
  Button
} from 'antd';

import {
  MenuOutlined
} from "@ant-design/icons"

import { MenuType } from '@/utils/menu'
import GlobalContext from "@/utils/globalContext";
import Request from "@/utils/request";
import {LogoutOutlined} from "@ant-design/icons";

type Breadcrumb = {
  label: string,
  link?: string
}

type Props = {
  breadcrumb?: Breadcrumb[],
  children: JSX.Element|JSX.Element[]
}

const Layout = (props: Props) => {

  const {
    children,
    breadcrumb
  } = props;

  const globalContext = React.useContext(GlobalContext)
  const user = globalContext.user.get

  const [menu, setMenu] = React.useState<MenuType[]>([])
  const [unread_messages, setUnreadMessages] = React.useState(0)
  const [new_budgets, setNewBudgets] = React.useState(0)
  const [collapsed, setCollapsed] = React.useState(false)

  React.useEffect(() => {
    if(user) buildMenu()
  }, [user])

  const buildMenu = async () => {
    let menu: any = sessionStorage.getItem('admin_menus')

    if(!menu) {
      const response = (await Request(user.jwt.access_token).get(`auth/me`)).data
      menu = Object.keys(response.admin_menus).map((id) => ({
        ...response.admin_menus[id],
        children: Object.keys(response.admin_menus[id].children).map((child_id) => ({
          ...response.admin_menus[id].children[child_id]
        }))
      }))
      sessionStorage.setItem('admin_menus', JSON.stringify(menu))
    }else{
      menu = JSON.parse(menu)
    }
    //@ts-ignore
    setMenu(menu)
  }

  /*
  const buildMenu = async () => {

    let roles: any = sessionStorage.getItem('roles')

    if(!roles){
      const response = (await Request(user.jwt.access_token).get("auth/me")).data
      roles = response.roles.map((role: any) => {
        return role.permissions.map((permission: any) => permission.name)
      })
      sessionStorage.setItem('roles', JSON.stringify(roles))
    }else{
      roles = JSON.parse(roles)
    }

    let permissions: any = []
    for(const role of roles){
      permissions = [...permissions, ...role]
    }

    let menu = menuItems.map(item => {
      return {
        ...item,
        children: item?.children?.filter(c => permissions.includes(c.permission)) || []
      }
    })
    setMenu(menu)
  }
   */

  React.useEffect(() => {
    const directMessage = menu.filter(menu => {
      return menu.children?.some(child => child.path === '/direct-messages')
    })

    const newBudgets = menu.filter(menu => {
      return menu.children?.some(child => child.path === '/sessions')
    })

    if (directMessage.length > 0) {
      getUnreadMessages()
    }

    if(newBudgets.length > 0){
      getNewBudgets()
    }

  }, [menu])

  const getNewBudgets = async () => {
    try{
      const response = (await Request(user.jwt.access_token).get('admin/sessions?visualized=0&is_budget=1')).data
      setNewBudgets(response.total)
    }catch (err){}
  }

  const getUnreadMessages = async () => {
    try {
      const response = (await Request(user.jwt.access_token).get('admin/messages?view_tutor=0')).data
      setUnreadMessages(response.total)
    } catch (err) {
    }
  }

  const logout = async () => {
    try{
      await Request(null, '/').get('api/logout')
      await Router.push('/login')
    }catch (err){}
  }

  return (
    <BaseLayout className='admin-root'>
      <BaseLayout.Sider
        breakpoint="lg"
        className='uow-sidebar'
        collapsedWidth="0"
        theme='light'
        collapsed={collapsed}
        width={240}>
        <Menu theme="light" mode="inline" className='menu'>
          {menu.map((item) => {
            return (item.children && item.children.length > 0 && (
              <Menu.ItemGroup key={item.key} title={<span className='menu__title'>{item.title}</span>}>
                {item.children?.map(child => {

                  if(child.path === '/direct-messages'){
                    return(
                        <Menu.Item key={child.key}>
                          <Badge count={unread_messages}>
                            <Link href={child.path || ''}>
                              <a>{child.title}</a>
                            </Link>
                          </Badge>
                        </Menu.Item>
                    )
                  }else if(child.path === '/sessions') {
                    return(
                        <Menu.Item key={child.key}>
                          <Badge count={new_budgets}>
                            <Link href={child.path || ''}>
                              <a>{child.title}</a>
                            </Link>
                          </Badge>
                        </Menu.Item>
                    )
                  }else{
                      return(
                          <Menu.Item key={child.key}>
                            <Link href={child.path || ''}>
                              <a>{child.title}</a>
                            </Link>
                          </Menu.Item>
                      )
                    }
                })}
              </Menu.ItemGroup>
            ))
          })}
        </Menu>
      </BaseLayout.Sider>
      <BaseLayout style={{minHeight: '100vh'}}>

        <BaseLayout.Header className={clsx('header', {collapsed})}>
          <div className='menu-toggle'>
            <MenuOutlined onClick={() => setCollapsed(!collapsed)} />
          </div>
          <span className='header__title'>CETT</span>
          {breadcrumb && breadcrumb.length > 0 && (
            <Breadcrumb
              className='breadcrumb'
              separator={<div className='breadcrumb__separator'>/</div>}>
              {breadcrumb.map((item, index) => (
                <Breadcrumb.Item
                  key={index}
                  className='breadcrumb__item'>
                  {item.link === undefined ? item.label : (
                    <Link href={item.link}>
                      <a className='breadcrumb__link'>{item.label}</a>
                    </Link>
                  )}
                </Breadcrumb.Item>
              ))}
            </Breadcrumb>
          )}
          <Button type="text" onClick={logout} className="logout">
            <span>SAIR</span>
            <LogoutOutlined />
          </Button>
        </BaseLayout.Header>

        <BaseLayout.Content className={clsx('content', {collapsed})}>
          {children}
        </BaseLayout.Content>
        <BaseLayout.Footer className='footer'>Digital UOW © 2020</BaseLayout.Footer>
      </BaseLayout>
    </BaseLayout>
  );
}

Layout.defaultProps = {
  breadcrumb: []
}

export default Layout;
