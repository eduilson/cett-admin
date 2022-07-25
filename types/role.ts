"use strict"

import {Permission} from "./permission";

export type Role = {
  id: number,
  name: string,
  guard_name: string,
  permissions: Permission[],
  created_at: string,
  updated_at: string,
}