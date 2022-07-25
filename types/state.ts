"use strict"

import {City} from "./city";

export type State = {
  id: number,
  name: string,
  abbreviation: string,
  cities?: City[]
}
