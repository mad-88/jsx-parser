export type MapType = {
  [key: string]: any;
};
export type ValueType =
  | string
  | number
  | boolean
  | null
  | Array<ValueType>
  | MapType;

export type NodeType = MapType;
