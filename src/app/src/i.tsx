import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import ForceGraph3D, { GraphData, NodeObject, LinkObject } from '3d-force-graph'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceZ
} from 'd3-force-3d'

import { DirectionalLightHelper } from 'three'
import { forceX, forceY } from 'd3-force'

interface Node {
  id: string
  community?: number
  x?: number
  y?: number
  z?: number
  vx?: number
  vy?: number
  vz?: number
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
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: []
  })
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)

  // this hook will run only once when the component mounts
  // makes the initial fetch requests to get the graph data
  // and the community labels
  // for each node in the graph data, we assign a random position in 3D space (-50 to 50)
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
      console.log("number of nodes", nodes.length)
      console.log("number of links", links.length)
      setGraphData({ nodes, links })
    })
  }, [])

  // this hook will run every time the graph
  // Inside the useEffect after setting up graphData
  useEffect(() => {
    if (graphData.nodes.length === 0 || graphData.links.length === 0) return

    const width = containerRef.current?.clientWidth || window.innerWidth
    const height = containerRef.current?.clientHeight || window.innerHeight

    if (!rendererRef.current) {
      rendererRef.current = new THREE.WebGLRenderer({ antialias: true })
      rendererRef.current.setSize(width, height)
      rendererRef.current.setClearColor(0x1f1f1f)
      containerRef.current?.appendChild(rendererRef.current.domElement)
    }

    const communityIds = Array.from(
      new Set(graphData.nodes.map(node => node.community))
    )

    // Assign a unique position for each community
    const communityCenters = {}
    const angleStep = (2 * Math.PI) / communityIds.length
    const radius = 1000

    communityIds.forEach((communityId, index) => {
      communityCenters[communityId] = {
        x: Math.cos(index * angleStep) * radius,
        y: Math.random() * 100 - 50,
        z: Math.sin(index * angleStep) * radius
      }
    })

    // Initialize node positions based on community centers with random offsets
    graphData.nodes.forEach(node => {
      const center = communityCenters[node.community!]
      node.x = center.x + (Math.random() - 0.5) * 100
      node.y = center.y + (Math.random() - 0.5) * 100
      node.z = center.z + (Math.random() - 0.5) * 1000
    })

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x1f1f1f, 0.1, 20000)

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 20000)
    camera.position.set(0, 0, 5000)
    camera.lookAt(0, 0, 0)

    const renderer = rendererRef.current
    const controls = new OrbitControls(camera, renderer.domElement)

    const simulation = forceSimulation<Node>(graphData.nodes)
      .force(
        'link',
        forceLink<Node, Link>(graphData.links)
          .id(d => d.id)
          .distance(100) // Controla la distancia entre nodos
      )
      .force('charge', forceManyBody().strength(-100))
      .force('center', forceCenter(0, 0, 0))
      // .force('collision', forceCollide<Node>().radius(10).strength(1))
      // Agrupa las fuerzas basadas en los centros de comunidad con mayor fuerza
      .force(
        'x',
        forceX<Node>()
          .strength(0.5) // Mayor fuerza para un agrupamiento más fuerte
          .x(d => communityCenters[d.community!].x)
      )
      .force(
        'y',
        forceY<Node>()
          .strength(0.5) // Mayor fuerza para un agrupamiento más fuerte
          .y(d => communityCenters[d.community!].y)
      )
      .force(
        'z',
        forceZ<Node>()
          .strength(1) // Mayor fuerza para un agrupamiento más fuerte
          .z(d => communityCenters[d.community!].z)
      )
      .on('tick', ticked)
      .on('end', () => {
        simulation.stop()
      })

    const nodeGeometry = new THREE.SphereGeometry(
      15, // Aumentamos el tamaño del nodo
      16,
      16
    )

    const nodeMaterials: { [id: string]: THREE.MeshStandardMaterial } = {} // Usamos MeshStandardMaterial
    const nodeMeshes: { [id: string]: THREE.Mesh } = {}

    const communityColors: { [communityId: number]: number } = {}
    communityIds.forEach((communityId, index) => {
      const hue = (index * 137.508) % 360
      const color = new THREE.Color(`hsl(${hue}, 50%, 40%)`).getHex()
      communityColors[communityId!] = color
    })

    graphData.nodes.forEach(node => {
      const color = communityColors[node.community!]
      const material = new THREE.MeshStandardMaterial({
        color,
        emissive: 0x000000, // Remove emissive to rely on scene lighting
        roughness: 0.5,
        metalness: 0.2
      }) // Material que reacciona a la luz
      nodeMaterials[node.id] = material

      const nodeMesh = new THREE.Mesh(nodeGeometry, material)
      nodeMesh.castShadow = true // Nodes cast shadows
      nodeMesh.receiveShadow = true // Nodes receive shadows
      nodeMeshes[node.id] = nodeMesh
      scene.add(nodeMesh)
    })

    const linkMaterial = new THREE.LineBasicMaterial({
      color: 0xf1f1f1,
      opacity: 0.04,
      transparent: true,
      fog: false
    })

    const linkGeometry = new THREE.BufferGeometry()
    const linkPositions = new Float32Array(graphData.links.length * 6)
    linkGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(linkPositions, 3)
    )
    const linkLines = new THREE.LineSegments(linkGeometry, linkMaterial)
    scene.add(linkLines)

    // ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1)
    scene.add(ambientLight)

    // Luz direccional principal con sombras
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2)
    directionalLight.position.set(0, 2000, -2000)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 512
    directionalLight.shadow.mapSize.height = 512
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 5000
    scene.add(directionalLight)

    function ticked () {
      graphData.nodes.forEach(node => {
        const nodeMesh = nodeMeshes[node.id]
        nodeMesh.position.set(node.x!, node.y!, node.z!)
      })

      graphData.links.forEach((link, i) => {
        const source = link.source as Node
        const target = link.target as Node

        linkPositions[i * 6 + 0] = source.x!
        linkPositions[i * 6 + 1] = source.y!
        linkPositions[i * 6 + 2] = source.z!

        linkPositions[i * 6 + 3] = target.x!
        linkPositions[i * 6 + 4] = target.y!
        linkPositions[i * 6 + 5] = target.z!
      })

      linkGeometry.attributes.position.needsUpdate = true
    }

    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      const width = containerRef.current?.clientWidth || window.innerWidth
      const height = containerRef.current?.clientHeight || window.innerHeight
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      scene.clear()
      simulation.stop()
    }
  }, [graphData])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', backgroundColor: '#1F1F1F' }}
    />
  )
}

export default Graph

