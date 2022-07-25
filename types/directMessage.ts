"use strict"

import {User} from "./user";

export type DirectMessage = {
    id: number,
    user_id: number,
    student?: User,
    tutor_id: number,
    author: 'student'|'tutor',
    text: string,
    view_user: boolean,
    view_tutor: boolean,
    status: boolean,
    created_at: string,
    updated_at: string,
    unread_messages?: number,
}
