"use strict"

export type Banner = {
    id: number,
    title: string,
    title_color: string,
    content: string,
    content_color: string,
    image: string,
    link: string,
    link_text: string,
    link_color: string,
    caption_position: 'topLeft'|'topCenter'|'topRight'|'centerLeft'|'center'|'centerRight'|'bottomLeft'|'bottomCenter'|'bottomRight',
    link_background: string,
    target: '_blank'|'_self'|'_parent'|'_top',
    sort_order: number,
    status: boolean,
    created_at: string,
    updated_at: string,
}
