"use strict"

import {State} from "./state";

export type CourseState = {
    id: number,
    state: State,
    state_id: number,
    excerpt: string,
    content: string,
    enable_slider: boolean,
    slider_title: string,
    slider_subtitle: string,
    image: string,
    price: string,
    status: boolean,
    created_at: string,
    updated_at: string,
}
