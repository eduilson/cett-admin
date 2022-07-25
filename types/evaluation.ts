"use strict"

import {Order} from "./order";
import {EvaluationResponse} from "./evaluationResponse";

export type Evaluation = {
    id: number,
    user_id: number,
    order: Order,
    order_id: number,
    model: 'Module'|'Course',
    model_id: number,
    score: number,
    finished: boolean,
    approved: boolean,
    created_at: string,
    updated_at: string,
    responses: EvaluationResponse[]
}
