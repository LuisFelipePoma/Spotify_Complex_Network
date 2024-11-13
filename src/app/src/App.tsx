import React from 'react'
import Graph from './Graph'

const App: React.FC = () => {
  return (
    <main className='w-full h-[100vh] flex'>
      <section className='w-[40%]'>
        <h1 className='p-0 m-0 bg-transparent'>Graph Visualization</h1>
        <p className='bg-transparent'>
          A simple graph visualization using D3.js and React.
        </p>
      </section>
      <section className='w-[60%] h-full p-[15px]'>
        <Graph />
      </section>
    </main>
  )
}

export default App
