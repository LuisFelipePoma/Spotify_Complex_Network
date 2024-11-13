// import React, { useEffect, useRef, useState } from 'react'
// import * as d3 from 'd3'

// interface Node {
//   id: string
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
//   const svgRef = useRef<SVGSVGElement | null>(null)

//   useEffect(() => {
//     fetch('/data/sample.csv')
//       .then(response => response.text())
//       .then(data => {
//         const rows = data.split('\n').slice(0, 5000)
//         const nodes: Node[] = []
//         const links: Link[] = []

//         rows.forEach(row => {
//           const [source, target, weight] = row.split(';')
//           nodes.push({ id: source })
//           nodes.push({ id: target })
//           links.push({ source, target, value: parseFloat(weight) })
//         })

//         const uniqueNodes = Array.from(new Set(nodes.map(node => node.id))).map(
//           id => ({ id })
//         )

//         setGraphData({ nodes: uniqueNodes, links })
//       })
//   }, [])

//   useEffect(() => {
//     if (graphData.nodes.length === 0 || graphData.links.length === 0) return

//     const svg = d3.select(svgRef.current)
//     svg.selectAll('*').remove()

//     const width = window.innerWidth
//     const height = window.innerHeight

//     const simulation = d3
//       .forceSimulation(graphData.nodes)
//       .force(
//         'link',
//         d3
//           .forceLink(graphData.links)
//           .id((d: any) => d.id)
//           .distance(50)
//       )
//       .force('charge', d3.forceManyBody().strength(-200))
//       .force('center', d3.forceCenter(width / 2, height / 2))

//     const container = svg.append('g')

//     const zoom = d3.zoom().on('zoom', event => {
//       container.attr('transform', event.transform)
//     })

//     svg.call(zoom)

//     const link = container
//       .append('g')
//       .attr('stroke', '#999')
//       .attr('stroke-opacity', 0.1)
//       .selectAll('line')
//       .data(graphData.links)
//       .enter()
//       .append('line')
//       .attr('stroke-width', d => Math.sqrt(d.value))

//     const node = container
//       .append('g')
//       .attr('stroke', '#ffffffff')
//       .attr('stroke-width', 0.5)
//       .selectAll('circle')
//       .data(graphData.nodes)
//       .enter()
//       .append('circle')
//       .attr('r', 5)
//       .attr('fill', d => d3.schemeCategory10[d.id.charCodeAt(0) % 10])
//       .call(
//         d3
//           .drag()
//           .on('start', dragstarted)
//           .on('drag', dragged)
//           .on('end', dragended)
//       )
//       .on('mouseover', function (event, d) {
//         d3.select(this).transition().duration(100).attr('r', 10)
//       })
//       .on('mouseout', function (event, d) {
//         d3.select(this).transition().duration(100).attr('r', 5)
//       })

//     node.append('title').text(d => d.id)

//     simulation.on('tick', () => {
//       link
//         .attr('x1', d => (d.source as Node).x!)
//         .attr('y1', d => (d.source as Node).y!)
//         .attr('x2', d => (d.target as Node).x!)
//         .attr('y2', d => (d.target as Node).y!)

//       node.attr('cx', d => d.x!).attr('cy', d => d.y!)
//     })

//     function dragstarted (event: any, d: any) {
//       if (!event.active) simulation.alphaTarget(0.3).restart()
//       d.fx = d.x
//       d.fy = d.y
//     }

//     function dragged (event: any, d: any) {
//       d.fx = event.x
//       d.fy = event.y
//     }

//     function dragended (event: any, d: any) {
//       if (!event.active) simulation.alphaTarget(0)
//       d.fx = null
//       d.fy = null
//     }
//   }, [graphData])

//   return (
//     <svg
//       ref={svgRef}
//       viewBox={`250 0 ${window.innerWidth / 1.5} ${window.innerHeight}`}
//       className='bg-[#1F1F1F] w-full h-full rounded-xl'
//     />
//   )
// }

// export default Graph
