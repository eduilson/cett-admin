import React, {Context} from 'react';
import {User} from "@/types"

const GlobalContext: Context<any> = React.createContext({});

export type GlobalContextT = {
    user: {
        get: User,
        set: (data: User) => void
    }
}

export default GlobalContext
