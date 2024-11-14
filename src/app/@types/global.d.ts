declare module 'd3-force-3d' {
  export function forceSimulation<NodeType extends SimulationNodeDatum>(
    nodes?: NodeType[],
    n: number
  ): ForceSimulation<NodeType>

  export function forceLink<NodeType extends SimulationNodeDatum, LinkType>(
    links?: LinkType[]
  ): ForceLink3D<NodeType, LinkType>

  export function forceManyBody<
    NodeType extends SimulationNodeDatum
  >(): ForceManyBody3D<NodeType>

  export function forceCenter<NodeType extends SimulationNodeDatum>(
    x?: number,
    y?: number,
    z?: number
  ): ForceCenter3D<NodeType>
}
