// import React, { useEffect, useRef, useState } from 'react'
// import * as THREE from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// interface Node {
//   id: string
//   x?: number
//   y?: number
//   z?: number
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
//         const rows = data.split('\n').slice(0, 10000)
//         const nodes: Node[] = []
//         const links: Link[] = []

//         rows.forEach(row => {
//           const [source, target, weight] = row.split(';')
//           nodes.push({ id: source })
//           nodes.push({ id: target })
//           links.push({ source, target, value: parseFloat(weight) })
//         })

//         const uniqueNodes = Array.from(new Set(nodes.map(node => node.id))).map(
//           id => ({
//             id,
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

//     const scene = new THREE.Scene()
//     const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
//     camera.position.z = 150

//     const renderer = new THREE.WebGLRenderer({ antialias: true })
//     renderer.setSize(width, height)
//     renderer.setClearColor(0x1f1f1f)
//     containerRef.current?.appendChild(renderer.domElement)

//     const controls = new OrbitControls(camera, renderer.domElement)

//     const nodeGeometry = new THREE.SphereGeometry(1, 16, 16)
//     const linkMaterial = new THREE.LineBasicMaterial({
//       color: 0x999999,
//       opacity: 0.1,
//       transparent: true
//     })

//     const nodeMaterials: { [id: string]: THREE.MeshBasicMaterial } = {}
//     graphData.nodes.forEach(node => {
//       const material = new THREE.MeshBasicMaterial({
//         color: new THREE.Color(
//           `hsl(${(node.id.charCodeAt(0) % 10) * 36}, 100%, 50%)`
//         )
//       })
//       nodeMaterials[node.id] = material

//       const nodeMesh = new THREE.Mesh(nodeGeometry, material)
//       nodeMesh.position.set(node.x!, node.y!, node.z!)
//       scene.add(nodeMesh)
//     })

//     const linkGeometry = new THREE.BufferGeometry()
//     const positions = new Float32Array(graphData.links.length * 6)
//     graphData.links.forEach((link, i) => {
//       const sourceNode = graphData.nodes.find(n => n.id === link.source)
//       const targetNode = graphData.nodes.find(n => n.id === link.target)
//       if (sourceNode && targetNode) {
//         positions.set(
//           [
//             sourceNode.x!,
//             sourceNode.y!,
//             sourceNode.z!,
//             targetNode.x!,
//             targetNode.y!,
//             targetNode.z!
//           ],
//           i * 6
//         )
//       }
//     })

//     linkGeometry.setAttribute(
//       'position',
//       new THREE.BufferAttribute(positions, 3)
//     )
//     const linkLines = new THREE.LineSegments(linkGeometry, linkMaterial)
//     scene.add(linkLines)

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
