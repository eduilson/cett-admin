"use strict"

export type QuestionOption = {
    id: number,
    question_id: number,
    answer: string,
    is_right: boolean,
    status: boolean,
    created_at: string,
    updated_at: string,
}
