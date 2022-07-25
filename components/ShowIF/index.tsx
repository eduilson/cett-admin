import React from 'react';
import GlobalContext from '@/utils/globalContext';
import Request from '@/utils/request';

type Props = {
    permissions: string[]
}

const ShowIF: React.FC<Props> = (props) => {
    const globalContext = React.useContext(GlobalContext)
    const user = globalContext.user.get

    const [show, setShow] = React.useState(false)
    const [permissions, setPermissions] = React.useState<string[]>([])

    React.useEffect(() => {
        if (user?.id) getPermissions()
    }, [user])

    React.useEffect(() => {
        const allowed = permissions.some((p) => {
            return props.permissions.includes(p)
        })
        setShow(allowed)
    }, [permissions])

    const getPermissions = async () => {

        try {
            // @ts-ignore
            let permissions: any = sessionStorage.getItem('permissions')

            if (!permissions) {
                const response = await Request(user.jwt.access_token).get('auth/permissions')
                permissions = []
                for (const p of response.data) {
                    if (permissions.indexOf(p.name) === -1) {
                        permissions.push(p.name)
                    }
                }
                sessionStorage.setItem('permissions', JSON.stringify(permissions))
            } else {
                permissions = JSON.parse(permissions)
            }

            setPermissions(permissions)
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <React.Fragment>
            {show && props.children}
        </React.Fragment>
    )
}

export default ShowIF
