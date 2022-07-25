"use strict"

import {QuestionOption} from "./questionOption";
import {QuestionTopic} from "./questionTopic";

export type Question = {
    id: number,
    question_topic_id: number,
    text: string,
    feedback: string,
    created_at: string,
    updated_at: string,
    question_options: QuestionOption[],
    question_topic: QuestionTopic
}
