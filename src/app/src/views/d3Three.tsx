// import React, { useEffect, useRef, useState } from 'react'
// import * as THREE from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// import {
//   forceSimulation,
//   forceLink,
//   forceManyBody,
//   forceCenter
// } from 'd3-force-3d'

// interface Node {
//   id: string
//   community?: number
//   x?: number
//   y?: number
//   z?: number
//   vx?: number
//   vy?: number
//   vz?: number
// }

// interface Link {
//   source: string
//   target: string
//   value: number
// }

// interface GraphData {
//   nodes: Node[]
//   links: Link[]
// }

// const Graph: React.FC = () => {
//   const [graphData, setGraphData] = useState<GraphData>({
//     nodes: [],
//     links: []
//   })
//   const containerRef = useRef<HTMLDivElement | null>(null)

//   useEffect(() => {
//     fetch('/data/sample.csv')
//       .then(response => response.text())
//       .then(data => {
//         const rows = data.split('\n')
//         const nodes: Node[] = []
//         const links: Link[] = []

//         rows.forEach(row => {
//           const [source, target, weight] = row.split(';')
//           nodes.push({ id: source })
//           nodes.push({ id: target })
//           links.push({ source, target, value: parseFloat(weight) })
//         })

//         const uniqueNodes = Array.from(new Set(nodes.map(node => node.id))).map(
//           (id, index) => ({
//             id,
//             community: index % 5, // Asigna una comunidad de ejemplo
//             x: Math.random() * 100 - 50,
//             y: Math.random() * 100 - 50,
//             z: Math.random() * 100 - 50
//           })
//         )

//         setGraphData({ nodes: uniqueNodes, links })
//       })
//   }, [])

//   useEffect(() => {
//     if (graphData.nodes.length === 0 || graphData.links.length === 0) return

//     const width = containerRef.current?.clientWidth || window.innerWidth
//     const height = containerRef.current?.clientHeight || window.innerHeight

//     // Inicialización de la escena
//     const scene = new THREE.Scene()
//     scene.fog = new THREE.Fog(0x1f1f1f, 100, 20000) // Aumenta el valor para mayor distancia

//     // Configuración de la cámara con un plano de recorte lejano más elevado
//     const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 20000)
//     camera.position.z = 150

//     const renderer = new THREE.WebGLRenderer({ antialias: true })
//     renderer.setSize(width, height)
//     renderer.setClearColor(0x1f1f1f)
//     containerRef.current?.appendChild(renderer.domElement)

//     const controls = new OrbitControls(camera, renderer.domElement)

//     // Configura la simulación de fuerzas en 3D
//     const simulation = forceSimulation<Node>(graphData.nodes)
//       .force(
//         'link',
//         forceLink<Node, Link>(graphData.links)
//           .id(d => d.id)
//           .distance(50)
//       )
//       .force('charge', forceManyBody().strength(-30))
//       .force('center', forceCenter(0, 0, 0))
//       .on('tick', ticked)

//     // Crea materiales y geometrías
//     const nodeGeometry = new THREE.SphereGeometry(1, 16, 16)
//     const nodeMaterials: { [id: string]: THREE.MeshBasicMaterial } = {}
//     const nodeMeshes: { [id: string]: THREE.Mesh } = {}

//     // Paleta de colores para las comunidades
//     const communityColors = [
//       0xff0000, // Rojo
//       0x00ff00, // Verde
//       0x0000ff, // Azul
//       0xffff00, // Amarillo
//       0xff00ff // Magenta
//     ]

//     graphData.nodes.forEach(node => {
//       const color = communityColors[node.community! % communityColors.length]
//       const material = new THREE.MeshBasicMaterial({ color })
//       nodeMaterials[node.id] = material

//       const nodeMesh = new THREE.Mesh(nodeGeometry, material)
//       nodeMeshes[node.id] = nodeMesh
//       scene.add(nodeMesh)
//     })

//     // Geometría y material para las aristas
//     const linkMaterial = new THREE.LineBasicMaterial({
//       color: 0xf1f1f1, // Color blanco para mayor visibilidad
//       opacity: 0.05, // Opacidad completa
//       transparent: true,
//     })

//     const linkGeometry = new THREE.BufferGeometry()
//     const linkPositions = new Float32Array(graphData.links.length * 6)
//     linkGeometry.setAttribute(
//       'position',
//       new THREE.BufferAttribute(linkPositions, 3)
//     )
//     const linkLines = new THREE.LineSegments(linkGeometry, linkMaterial)
//     scene.add(linkLines)

//     const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
//     scene.add(ambientLight)

//     const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
//     directionalLight.position.set(0, 1, 1).normalize()
//     scene.add(directionalLight)

//     function ticked () {
//       graphData.nodes.forEach(node => {
//         const nodeMesh = nodeMeshes[node.id]
//         nodeMesh.position.set(node.x!, node.y!, node.z!)
//       })

//       graphData.links.forEach((link, i) => {
//         const source = link.source as Node
//         const target = link.target as Node
//         linkPositions[i * 6 + 0] = source.x!
//         linkPositions[i * 6 + 1] = source.y!
//         linkPositions[i * 6 + 2] = source.z!
//         linkPositions[i * 6 + 3] = target.x!
//         linkPositions[i * 6 + 4] = target.y!
//         linkPositions[i * 6 + 5] = target.z!
//       })

//       linkGeometry.attributes.position.needsUpdate = true
//     }

//     const animate = () => {
//       requestAnimationFrame(animate)
//       controls.update()
//       renderer.render(scene, camera)
//     }

//     animate()

//     const handleResize = () => {
//       const width = containerRef.current?.clientWidth || window.innerWidth
//       const height = containerRef.current?.clientHeight || window.innerHeight
//       renderer.setSize(width, height)
//       camera.aspect = width / height
//       camera.updateProjectionMatrix()
//     }

//     window.addEventListener('resize', handleResize)

//     return () => {
//       window.removeEventListener('resize', handleResize)
//       renderer.dispose()
//       scene.clear()
//       simulation.stop()
//     }
//   }, [graphData])

//   return (
//     <div
//       ref={containerRef}
//       style={{ width: '100%', height: '100%', backgroundColor: '#1F1F1F' }}
//     />
//   )
// }

// export default Graph
