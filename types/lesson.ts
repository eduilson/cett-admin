"use strict"

import {LessonSlider} from "./lessonSlider";

export type Lesson = {
    id: number,
    module_id: number,
    slug: string,
    name: string,
    value_time: string,
    sort_order: number,
    status: boolean,
    created_at: string,
    updated_at: string,
    sliders: LessonSlider[]
    sliders_count: number
    access_logs_count: number
}
