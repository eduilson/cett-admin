"use strict"

import {QuestionTopic} from "./questionTopic";
import {Evaluation} from "./evaluation";
import {Lesson} from "./lesson";
import {CourseState} from "./courseState";

export type Module = {
    id: number,
    model_id: number,
    model_type: string,
    slug: string,
    title: string,
    description: string,
    value_time: string,
    sort_order: number,
    is_introduction: boolean,
    status: boolean,

    /** Associations */
    question_topics: QuestionTopic[]
    evaluations: Evaluation[]
    lessons: Lesson[]
    course_states: CourseState[]
}
