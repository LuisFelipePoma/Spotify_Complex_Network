import { gsap } from 'gsap'
import TWEEN from '@tweenjs/tween.js'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {
  forceSimulation,
  forceLink,
  forceCenter,
  forceManyBody
} from 'd3-force-3d'

// Your existing code...
import { Link, NodeInfo } from './types/graph'
import { generateColorHex } from './utils/generate'

interface Props {
  setNodeArtist: React.Dispatch<React.SetStateAction<string | null>>
  NodeArtist: string | null
  setNodeHover: React.Dispatch<React.SetStateAction<string | null>>
  SetIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  setNumberCom: React.Dispatch<React.SetStateAction<number | null>>
  setComunity: React.Dispatch<React.SetStateAction<string>>
}

const Graph: React.FC<Props> = ({
  setNodeArtist,
  setNodeHover,
  SetIsLoading,
  NodeArtist,
  setNumberCom,
  setComunity
}) => {
  const [graphData, setGraphData] = useState<{
    nodes: NodeInfo[]
    links: Link[]
  }>({
    nodes: [],
    links: []
  })
  // importance a dict
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const nodeMeshesRef = useRef<{ [id: string]: THREE.Mesh }>({})
  const selectedMeshRef = useRef<THREE.Mesh | null>(null)

  // Function to handle node selection
  const handleNodeSelect = useCallback(
    (node: THREE.Mesh) => {
      const selectedNode = node.userData.node
      if (selectedNode && selectedNode.id) {
        setNodeArtist(selectedNode.id)
      } else {
        console.error('Node userData or id is missing')
        setNodeArtist(null)
      }
    },
    [setNodeArtist]
  )

  // Function to handle node selection
  const handleNodeHover = useCallback(
    (node: THREE.Mesh) => {
      const selectedNode = node.userData.node
      if (selectedNode && selectedNode.id) {
        setNodeHover(selectedNode.id)
      } else {
        console.error('Node userData or id is missing')
        setNodeHover(null)
      }
    },
    [setNodeHover]
  )

  // this hook will run only once when the component mounts
  // makes the initial fetch requests to get the graph data
  // and the community labels
  // for each node in the graph data, we assign a random position in 3D space (-50 to 50)
  useEffect(() => {
    fetch('/data/graph.graphml')
      .then(response => response.text())
      .then(graphml => {
        const parser = new DOMParser()
        const xml = parser.parseFromString(graphml, 'application/xml')
        const keys = Array.from(xml.getElementsByTagName('key')).reduce(
          (acc, key) => {
            const id = key.getAttribute('id')
            const attrName = key.getAttribute('attr.name')
            const forType = key.getAttribute('for')
            if (id && attrName && forType) {
              acc[id] = { name: attrName, for: forType }
            }
            return acc
          },
          {} as { [id: string]: { name: string; for: string } }
        )

        const nodesMap: { [id: string]: NodeInfo } = {}
        const links: Link[] = []

        Array.from(xml.getElementsByTagName('node')).forEach(node => {
          const nodeId = node.getAttribute('id')
          if (nodeId) {
            const nodeInfo: NodeInfo = { id: nodeId }
            Array.from(node.querySelectorAll('data')).forEach(data => {
              const key = data.getAttribute('key')
              const value = data.textContent
              if (key && keys[key] && keys[key].for === 'node' && value) {
                if (keys[key].name === 'importance') {
                  nodeInfo.importance = parseFloat(value)
                } else if (keys[key].name === 'community') {
                  nodeInfo.community = Number(value)
                }
              }
            })
            nodesMap[nodeId] = nodeInfo
          }
        })

        Array.from(xml.getElementsByTagName('edge')).forEach(edge => {
          const source = edge.getAttribute('source')
          const target = edge.getAttribute('target')
          if (source && target) {
            let value = 1
            Array.from(edge.querySelectorAll('data')).forEach(data => {
              const key = data.getAttribute('key')
              const valueText = data.textContent
              if (key && keys[key] && keys[key].for === 'edge' && valueText) {
                if (keys[key].name === 'weight') {
                  value = parseFloat(valueText)
                }
              }
            })
            links.push({ source, target, value })
          }
        })

        const nodes = Object.values(nodesMap)

        // Calculate the degree (number of connections) for each node
        const nodeDegrees: { [id: string]: number } = {}
        links.forEach(link => {
          nodeDegrees[link.source as string] =
            (nodeDegrees[link.source as string] || 0) + 1
          nodeDegrees[link.target as string] =
            (nodeDegrees[link.target as string] || 0) + 1
        })
        nodes.forEach(node => {
          node.degree = nodeDegrees[node.id] || 0
        })

        console.log('Número de nodos', nodes.length)
        console.log('Número de aristas', links.length)

        setGraphData({ nodes, links })
      })
      .catch(error => {
        console.error('Error al cargar el archivo GraphML:', error)
      })
  }, [])

  // this hook will run every time the graph
  // Inside the useEffect after setting up graphData
  useEffect(() => {
    if (graphData.nodes.length === 0 || graphData.links.length === 0) return

    const width = containerRef.current?.clientWidth || window.innerWidth
    const height = containerRef.current?.clientHeight || window.innerHeight

    if (!rendererRef.current) {
      rendererRef.current = new THREE.WebGLRenderer({
        antialias: false
      })
      rendererRef.current.setSize(width, height)
      rendererRef.current.setPixelRatio(window.devicePixelRatio)
      rendererRef.current.setClearColor(0x000000, 0) // Make background transparent
      containerRef.current?.appendChild(rendererRef.current.domElement)
    }

    const communityIds = Array.from(
      new Set(graphData.nodes.map(node => node.community))
    )

    const meshMaterials: { [communityId: number]: THREE.MeshStandardMaterial } =
      {}
    const communityColors: { [communityId: number]: number } = {}

    // Assign a unique position for each community
    const communityCenters: Record<
      string,
      { x: number; y: number; z: number }
    > = {}

    const numCommunities = communityIds.length
    setNumberCom(numCommunities)
    const radius = 100 // Radius of the sphere

    communityIds.forEach((communityId, index) => {
      const theta = (index / numCommunities) * 2 * Math.PI
      const phi = Math.acos((2 * (index + 0.5)) / numCommunities - 1)

      communityCenters[communityId!] = {
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi)
      }

      // Modifica los parámetros de saturación y luminosidad para obtener tonos más cercanos a los de Spotify
      const hue = generateColorHex(communityId!)
      const color = new THREE.Color(hue).getHex()
      communityColors[communityId!] = color
      meshMaterials[communityId!] = new THREE.MeshStandardMaterial({
        // bleding mode to oen to interact with light
        color,
        // blending: THREE.NormalBlending,
        transparent: false,
        metalness: 0.5, // Adjust metalness as needed
        roughness: 0.5, // Adjust roughness as needed
        side: THREE.DoubleSide
      })
    })

    // Initialize node positions around the community centers with minimal offset
    const offset = 500 // Reduced offset for tighter clustering

    graphData.nodes.forEach(node => {
      const center = communityCenters[node.community!]
      node.x = center.x + offset * node.importance!
      node.y = center.y + offset * node.importance!
      node.z = center.z + offset * node.importance!
    })

    const scene = new THREE.Scene()
    // fog
    scene.fog = new THREE.Fog(0x1a0033, 0.1, 15000)
    // Background color of the div of html
    scene.background = new THREE.Color(0x0a0d0f)

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 35000)
    camera.position.set(0, 0, 1500)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Initialize controls
    const renderer = rendererRef.current
    const controls = new OrbitControls(camera, renderer.domElement)
    // disabled drag
    controls.enablePan = false
    controls.enableZoom = true
    controls.zoomSpeed = 1.5
    controls.minDistance = 500
    controls.maxDistance = 3000
    controls.rotateSpeed = 0.7
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.1
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controlsRef.current = controls

    // Configuración de la simulación
    // Configuración de la simulación mejorada
    const simulation = forceSimulation<NodeInfo>(graphData.nodes, 3)
      .force(
        'link',
        forceLink<NodeInfo, Link>()
          .links(graphData.links)
          .id((d: NodeInfo) => d.id)
          .distance(500) // Ajustar la distancia según el valor
      )
      .force(
        'linkCommunity',
        forceLink<NodeInfo, Link>()
          .links(
            graphData.links.filter(link => {
              const source = link.source as NodeInfo
              const target = link.target as NodeInfo
              return source.community === target.community
            })
          )
          .id((d: NodeInfo) => d.id)
          .distance(
            (d: Link) =>
              1 /
              (d.value *
                ((d.target as NodeInfo).importance! *
                  (d.source as NodeInfo).importance!))
          )
      )
      .force('center', forceCenter(0, 0, 0)) // Centrar la simulación
      .force('charge', forceManyBody().strength(-35))
      .alphaDecay(0.05) // Aumentar la tasa de decaimiento alfa para estabilización más rápida
      .on('tick', ticked)
      .on('end', () => {
        console.log('Simulation ended')
        SetIsLoading(false)
      })
    // optimizations for performance

    // const nodeGeometry = new THREE.SphereGeometry(12, 8, 8)
    const nodeMeshes: { [id: string]: THREE.Mesh } = {}

    graphData.nodes.forEach(node => {
      const material = meshMaterials[node.community!]
      const nodeRadius = Math.max(6, Math.min(18, node.degree! * 2))
      const nodeGeometry = new THREE.SphereGeometry(nodeRadius, 6, 6)
      const nodeMesh = new THREE.Mesh(nodeGeometry, material)
      nodeMesh.castShadow = true
      nodeMesh.receiveShadow = true
      nodeMesh.userData = { node }
      nodeMesh.renderOrder = 1
      nodeMeshes[node.id] = nodeMesh

      scene.add(nodeMesh)
    })
    nodeMeshesRef.current = nodeMeshes

    // Modify the linkMaterial to ensure edges have appropriate color and opacity
    const linkMaterial = new THREE.LineBasicMaterial({
      // best color for edge in dark background
      color: 0xf6e0b5,
      opacity: 0.1,
      transparent: true
      // side: THREE.DoubleSide
    })

    const linkGeometry = new THREE.BufferGeometry()
    const linkPositions = new Float32Array(graphData.links.length * 6)
    linkGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(linkPositions, 3)
    )
    linkGeometry.computeBoundingBox()
    linkGeometry.computeBoundingSphere()

    // Create LineSegments with adjusted material
    const linkLines = new THREE.LineSegments(linkGeometry, linkMaterial)
    linkLines.renderOrder = 0 // Render edges behind nodes
    scene.add(linkLines)

    // ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1)
    scene.add(ambientLight)

    // Luz direccional principal con sombras
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2)
    directionalLight.position.set(0, 4000, -4000)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 5000
    directionalLight.shadow.mapSize.height = 5000
    directionalLight.shadow.camera.near = 1
    directionalLight.shadow.camera.far = 5000
    scene.add(directionalLight)

    // set iteration of shadow map
    function ticked () {
      graphData.nodes.forEach(node => {
        const nodeMesh = nodeMeshes[node.id]
        nodeMesh.position.set(node.x!, node.y!, node.z!)
      })
      graphData.links.forEach((link, i) => {
        const source = link.source as NodeInfo
        const target = link.target as NodeInfo

        linkPositions[i * 6 + 0] = source.x!
        linkPositions[i * 6 + 1] = source.y!
        linkPositions[i * 6 + 2] = source.z!

        linkPositions[i * 6 + 3] = target.x!
        linkPositions[i * 6 + 4] = target.y!
        linkPositions[i * 6 + 5] = target.z!
      })

      linkGeometry.attributes.position.needsUpdate = true
    }

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    let hoveredMesh: THREE.Mesh | null = null
    const originalScale = new THREE.Vector3()

    // Define the selected material once, preferably outside the onClick handler
    const selectedMaterial = new THREE.MeshStandardMaterial({ color: 0x1db954 })

    const onClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(Object.values(nodeMeshes))

      if (intersects.length > 0) {
        const intersected = intersects[0].object as THREE.Mesh

        // Revert the material of the previously selected mesh
        if (selectedMeshRef.current) {
          selectedMeshRef.current.material =
            meshMaterials[selectedMeshRef.current.userData.node.community!]
        }

        // Set the material of the newly selected mesh
        intersected.material = selectedMaterial
        selectedMeshRef.current = intersected

        // Send changes
        handleNodeSelect(intersected)
      }
    }

    // Reducir la frecuencia
    let hoverRequestId: number | null = null
    const onMouseMove = (event: MouseEvent) => {
      if (hoverRequestId !== null) return
      hoverRequestId = requestAnimationFrame(() => {
        hoverRequestId = null
        const rect = renderer.domElement.getBoundingClientRect()
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

        raycaster.setFromCamera(mouse, camera)
        const intersects = raycaster.intersectObjects(Object.values(nodeMeshes))

        if (intersects.length > 0) {
          const intersected = intersects[0].object as THREE.Mesh
          handleNodeHover(intersected)
          if (hoveredMesh !== intersected) {
            if (hoveredMesh) {
              hoveredMesh.scale.copy(originalScale)
            }
            hoveredMesh = intersected
            originalScale.copy(hoveredMesh.scale)
            hoveredMesh.scale.set(1.5, 1.5, 1.5) // Enlarge hovered node
          }
        } else {
          setNodeHover(null)
          if (hoveredMesh) {
            hoveredMesh.scale.copy(originalScale)
            hoveredMesh = null
          }
        }
      })
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      TWEEN.update()
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
    // add event when the click leaves
    renderer.domElement.addEventListener('dblclick', onClick)
    renderer.domElement.addEventListener('mousemove', onMouseMove)

    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.domElement.removeEventListener('click', onClick)
      renderer.domElement.removeEventListener('mousemove', onMouseMove)
      renderer.dispose()
      scene.clear()
      simulation.stop()
      SetIsLoading(true)
    }
  }, [
    SetIsLoading,
    graphData,
    handleNodeHover,
    handleNodeSelect,
    setNodeHover,
    setNumberCom
  ])

  // DETECT CHANGES
  useEffect(() => {
    if (
      NodeArtist &&
      graphData.nodes.length > 0 &&
      cameraRef.current &&
      controlsRef.current
    ) {
      const targetNode = graphData.nodes.find(node => node.id == NodeArtist)
      if (targetNode) {
        const camera = cameraRef.current

        /// Animar la posición de la cámara
        gsap.to(camera.position, {
          x: targetNode.x!,
          y: targetNode.y!,
          z: targetNode.z!,
          duration: 1.5,
          onUpdate: () => {
            camera.lookAt(targetNode.x!, targetNode.y!, targetNode.z!)
          }
        })

        // Reset previous selected mesh material
        if (selectedMeshRef.current) {
          selectedMeshRef.current.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(
              generateColorHex(selectedMeshRef.current.userData.node.community!)
            ).getHex(),
            emissive: 0x000000,
            roughness: 0.5,
            metalness: 0.2
          })
        }

        const selectedMesh = nodeMeshesRef.current[NodeArtist]
        if (selectedMesh) {
          selectedMesh.material = new THREE.MeshStandardMaterial({
            color: 0x1db954,
            emissive: 0x000000,
            roughness: 0.5,
            metalness: 0.2
          })
          setComunity(String(targetNode.community))
          selectedMeshRef.current = selectedMesh
        }
      }
    }
  }, [NodeArtist, graphData.nodes, setComunity])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}

export default Graph
