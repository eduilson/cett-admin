"use strict"

import { Course } from "./course";

export type Contract = {
  id: number,
  course_id: number,
  title: string
  text: string,
  required: boolean,
  course?: Course
}
