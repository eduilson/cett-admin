"use strict"

import {User} from "./user";
import {Course} from "./course";
import {CourseState} from "./courseState";
import {OrderStatus} from "./orderStatus";
import {Evaluation} from "./evaluation";
import {Module} from "./module";

export type Order = {
    id: number,
    user_id: number,
    course_id: number,
    course_state_id?: number,
    order_status_id: number,
    renach: string,
    amount: number,
    discount: number,
    transaction_code: string,
    transaction_id: string,
    payment_method: 'manual' | 'boleto' | 'credit_card' | 'debit' | 'pix',
    payment_barcode: string,
    payment_url: string,
    payment_qrcode: string,
    certificate: string,
    created_at: string,
    updated_at: string,

    /** Associations */
    user: User,
    course: Course
    course_state?: CourseState,
    order_status: OrderStatus,
    evaluations: Evaluation[]
    modules: Module[]
}
