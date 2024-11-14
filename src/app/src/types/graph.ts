export interface NodeInfo {
  id: string
  community?: number
  importance?: number
  x?: number
  y?: number
  z?: number
  vx?: number
  vy?: number
  vz?: number
}

export interface Link {
  source: NodeInfo | string
  target: NodeInfo | string
  value: number
}

export interface GraphData {
  nodes: NodeInfo[]
  links: Link[]
}
