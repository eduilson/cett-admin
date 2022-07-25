"use strict"

export type Page = {
    id: number,
    slug: string,
    title: string,
    banner: string,
    content: string,
    status: boolean,
    created_at: string,
    updated_at: string,
}
