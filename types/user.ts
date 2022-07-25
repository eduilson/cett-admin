"use strict"

import {Role} from "./role"
import {Address} from "./address";
import {Account} from "./account";

export type User = {
    id: number,
    name: string,
    email: string,
    avatar?: string,
    roles: Role[],
    address?: Address,
    jwt: { access_token: string },
    phone: string,
    cpf: string,
    account_id?: number,
    email_verified_at: string,
    unread_messages?: number,
    total_messages?: number,
    created_at: string,
    updated_at: string,

    // Relationships
    direct_messages_count: number
    account?: Account
}
