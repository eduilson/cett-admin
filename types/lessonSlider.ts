"use strict"

export type LessonSlider = {
    id: string,
    lesson_id: number,
    slug: string,
    title: string,
    content: string,
    video_url: string,
    audio: string,
    time: string,
    sort_order: number,
    status: boolean,
    created_at: string,
    updated_at: string,
}
