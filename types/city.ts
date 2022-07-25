"use strict"

import { State } from "./state";

export type City = {
  id: number,
  name: string,
  state_id: number,
  state?: State
}