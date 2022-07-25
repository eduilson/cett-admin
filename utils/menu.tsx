"use strict"

export type MenuType = {
  title: string,
  key: string,
  children?: MenuType[],
  path?: string,
}
