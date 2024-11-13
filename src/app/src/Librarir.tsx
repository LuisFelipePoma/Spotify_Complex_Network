import React, { Suspense, useEffect, useState } from 'react'
import { ForceGraph3D } from 'react-force-graph'
interface Node {
  id: string
  community?: number
}

interface Link {
  source: string
  target: string
  value: number
}

interface GraphData {
  nodes: Node[]
  links: Link[]
}

const Graph: React.FC = () => {
  const [isGraphVisible, setGraphVisible] = useState(false)
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: []
  })

  useEffect(() => {
    Promise.all([
      fetch('/data/sample.csv').then(response => response.text()),
      fetch('/data/edges/ArtistW_labels.json').then(response => response.json())
    ]).then(([csvData, labelsData]) => {
      const rows = csvData.split('\n')
      const nodesMap: { [id: string]: Node } = {}
      const links: Link[] = []

      // labelsData is an object where the keys are the node ids
      rows.forEach(row => {
        const [source, target, weight] = row.split(';')
        if (!nodesMap[source]) {
          nodesMap[source] = { id: source }
        }
        if (!nodesMap[target]) {
          nodesMap[target] = { id: target }
        }
        links.push({ source, target, value: parseFloat(weight) })
      })

      // Asigna una comunidad de ejemplo
      const nodes = Object.values(nodesMap).map(node => ({
        ...node,
        community: labelsData[node.id],
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        z: Math.random() * 100 - 50
      }))

      //TODO FIND HUBS
      setGraphData({ nodes, links })
    })
  }, [])

  return (
    <div>
      <button onClick={() => setGraphVisible(!isGraphVisible)}>
        {isGraphVisible ? 'Ocultar Gráfica' : 'Mostrar Gráfica'}
      </button>

      {isGraphVisible && (
        <Suspense fallback={<div>Cargando gráfica...</div>}>
          <ForceGraph3D
            graphData={graphData}
            enableNodeDrag={false} // Deshabilitar arrastrar nodos
            nodeLabel={''} // Deshabilitar etiquetas de nodo
            nodeAutoColorBy='community'
            linkColor={() => 'rgba(241, 241, 241, 0.04)'} // Opacidad similar a tu implementación
            linkResolution={0.1} // Reducir resolución de enlaces
            // nodeResolution={0.8} // Reducir resolución de nodos
            showNavInfo={false} // Deshabilitar información de navegación
            enableNavigationControls={true} // Deshabilitar controles de navegación si no son necesarios
            backgroundColor='#1F1F1F' // Coincidir con el color de fondo de tu implementación
            rendererConfig={{
              antialias: false, // Deshabilitar antialiasing
              alpha: false, // Deshabilitar transparencia
              preserveDrawingBuffer: false, // Mejorar rendimiento
              powerPreference: 'high-performance',
              logarithmicDepthBuffer: false // Deshabilitar para mejorar rendimiento
              // Deshabilitar sombras
            }}
            // Opcional: Limitar el número de iteraciones del force layout
            cooldownTicks={150}
            cooldownTime={5000}
            warmupTicks={0}
            numDimensions={3}
          />
        </Suspense>
      )}
    </div>
  )
}

export default Graph
