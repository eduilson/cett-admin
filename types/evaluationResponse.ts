"use strict"

import {Question} from "./question";

export type EvaluationResponse = {
    id: number,
    evaluation_id: number,
    question_id: number,
    question: Question,
    question_option_id: number,
    correct: boolean,
    created_at: string,
    updated_at: string
}
