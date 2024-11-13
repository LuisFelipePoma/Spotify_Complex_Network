// import React, { useEffect, useRef, useState } from 'react'
// import * as THREE from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// interface Node {
//   id: string
//   x?: number
//   y?: number
//   z?: number
//   community: number
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
//         const rows = data.split('\n').slice(0, 500)
//         const nodes: Node[] = []
//         const links: Link[] = []

//         rows.forEach(row => {
//           const [source, target, weight] = row.split(';')
//           nodes.push({ id: source, community: Math.floor(Math.random() * 5) })
//           nodes.push({ id: target, community: Math.floor(Math.random() * 5) })
//           links.push({ source, target, value: parseFloat(weight) })
//         })

//         const uniqueNodes = Array.from(new Set(nodes.map(node => node.id))).map(
//           id => ({
//             id,
//             community: Math.floor(Math.random() * 5),
//             x: Math.random() * 5 - 15,
//             y: Math.random() * 5 - 15,
//             z: Math.random() * 5 - 15
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
//     camera.position.set(0, 0, 100)

//     const renderer = new THREE.WebGLRenderer({ antialias: true })
//     renderer.setSize(width, height)
//     renderer.setClearColor(0x1f1f1f)
//     containerRef.current?.appendChild(renderer.domElement)

//     const controls = new OrbitControls(camera, renderer.domElement)

//     const nodeGeometry = new THREE.SphereGeometry(1.5, 16, 16)
//     const linkMaterial = new THREE.LineBasicMaterial({
//       color: 0x999999,
//       opacity: 0.5,
//       transparent: true
//     })

//     const nodeMaterials: { [id: string]: THREE.MeshBasicMaterial } = {}
//     const nodes = graphData.nodes.map(node => {
//       const material = new THREE.MeshBasicMaterial({
//         color: new THREE.Color(`hsl(${node.community * 72}, 100%, 50%)`)
//       })
//       nodeMaterials[node.id] = material

//       const nodeMesh = new THREE.Mesh(nodeGeometry, material)
//       nodeMesh.position.set(node.x!, node.y!, node.z!)
//       scene.add(nodeMesh)

//       return { mesh: nodeMesh, data: node }
//     })

//     const linkGeometry = new THREE.BufferGeometry()
//     const positions = new Float32Array(graphData.links.length * 6)
//     const links = graphData.links.map((link, i) => {
//       const sourceNode = nodes.find(n => n.data.id === link.source)
//       const targetNode = nodes.find(n => n.data.id === link.target)
//       if (sourceNode && targetNode) {
//         positions.set(
//           [
//             sourceNode.mesh.position.x,
//             sourceNode.mesh.position.y,
//             sourceNode.mesh.position.z,
//             targetNode.mesh.position.x,
//             targetNode.mesh.position.y,
//             targetNode.mesh.position.z
//           ],
//           i * 6
//         )
//       }
//       return { source: sourceNode?.mesh, target: targetNode?.mesh }
//     })

//     linkGeometry.setAttribute(
//       'position',
//       new THREE.BufferAttribute(positions, 3)
//     )
//     const linkLines = new THREE.LineSegments(linkGeometry, linkMaterial)
//     scene.add(linkLines)

//     const animate = () => {
//       requestAnimationFrame(animate)

//       nodes.forEach(({ mesh, data: node }) => {
//         let fx = 0,
//           fy = 0,
//           fz = 0

//         nodes.forEach(({ mesh: otherMesh, data: otherNode }) => {
//           if (node.id !== otherNode.id) {
//             const dx = otherMesh.position.x - mesh.position.x
//             const dy = otherMesh.position.y - mesh.position.y
//             const dz = otherMesh.position.z - mesh.position.z
//             const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

//             const repulsion = Math.min(0.1 / (distance + 0.5), 0.1)
//             fx -= repulsion * dx
//             fy -= repulsion * dy
//             fz -= repulsion * dz
//           }
//         })

//         graphData.links.forEach(link => {
//           if (link.source === node.id || link.target === node.id) {
//             const otherMesh = nodes.find(
//               n =>
//                 n.data.id ===
//                 (link.source === node.id ? link.target : link.source)
//             )?.mesh
//             if (otherMesh) {
//               const dx = otherMesh.position.x - mesh.position.x
//               const dy = otherMesh.position.y - mesh.position.y
//               const dz = otherMesh.position.z - mesh.position.z
//               const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
//               const attraction = Math.min(distance * 0.001, 0.03)

//               fx += attraction * dx
//               fy += attraction * dy
//               fz += attraction * dz
//             }
//           }
//         })

//         mesh.position.x += fx
//         mesh.position.y += fy
//         mesh.position.z += fz
//       })

//       const positions = linkGeometry.attributes.position.array as Float32Array
//       links.forEach((link, i) => {
//         if (link.source && link.target) {
//           positions[i * 6] = link.source.position.x
//           positions[i * 6 + 1] = link.source.position.y
//           positions[i * 6 + 2] = link.source.position.z
//           positions[i * 6 + 3] = link.target.position.x
//           positions[i * 6 + 4] = link.target.position.y
//           positions[i * 6 + 5] = link.target.position.z
//         }
//       })
//       linkGeometry.attributes.position.needsUpdate = true

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
