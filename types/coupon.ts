"use strict"

export type Coupon = {
    id: number,
    code: string,
    name: string,
    amount: number,
    discount: number,
    in_percentage: boolean,
    created_at: string,
    updated_at: string,
}
