"use strict"

import {State} from "./state";
import {Order} from "./order";

export type DetranLog = {
    id: number
    state_id: number
    order_id: number
    routine: string
    cpf: string
    renach: string
    parameters: any
    sending_data: any
    received_data: any
    created_at: string
    updated_at: string

    state: State
    order: Order
}
