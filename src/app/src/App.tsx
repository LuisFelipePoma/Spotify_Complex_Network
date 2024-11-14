import React, { useEffect, useState } from 'react'
import Graph from './Graph'
import Loading from './components/Loading'
import './App.css'

interface ArtistIndex {
  [key: string]: string
}

interface ArtistName {
  [key: string]: string
}

function getArtistName (name: string): string {
  return name.replace(/_/g, ' ')
}

const App: React.FC = () => {
  const [nodeArtist, setNodeArtist] = useState<string | null>(null)
  const [nodeHover, setNodeHover] = useState<string | null>(null)
  const [artistIndex, setArtistIndex] = useState<ArtistIndex>({})
  const [artistNames, setArtistNames] = useState<ArtistName>({})
  const [artistSearch, setArtistSearch] = useState<string[][]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    fetch('/data/edges/ArtistW_index.json')
      .then(response => response.json())
      .then(data => setArtistIndex(data))
      .catch(error => console.error('Error fetching ArtistIndex:', error))

    fetch('/data/edges/ArtistW_name.json')
      .then(response => response.json())
      .then(data => setArtistNames(data))
      .catch(error => console.error('Error fetching ArtistIndex:', error))
  }, [])

  function handleSearch (e: React.ChangeEvent<HTMLInputElement>) {
    // setNodeSearch(e.target.value)
    const search = e.target.value.toLowerCase()
    if (search.trim() === '') {
      setArtistSearch([])
      return
    }
    // search all artist index that matches the search in artistNames and save the key and the value
    const artists = Object.keys(artistNames).filter(key =>
      key.replace(/_/g, ' ').toLowerCase().includes(search)
    )

    // map artist with the key
    const results = artists.map(artist => [artist, artistNames[artist]])

    if (artistSearch) {
      setArtistSearch(results)
    }
  }

  function handleResult (artist: string) {
    setNodeArtist(artist)
  }

  return (
    <main className='w-full h-[100vh] flex bg-accent relative text-light'>
      {nodeArtist && (
        <p className='absolute top-5 right-[40%] z-50 text-center select-none'>
          Artista Seleccionado:{' '}
          <span className='font-bold text-primary text-lg'>
            {getArtistName(artistIndex[nodeArtist])}
          </span>
        </p>
      )}
      {isLoading && <Loading />}
      {nodeHover && (
        // Center
        <p className='absolute z-50 select-none top-5 right-5'>
          Artist : <span>{getArtistName(artistIndex[nodeHover])}</span>
        </p>
      )}
      {!isLoading && (
        <>
          <section className='top-5 left-5 z-50 w-[425px] select-none flex flex-col gap-3 absolute'>
            <search className='flex flex-col max-h-[800px] w-[400px] bg-accent/50 rounded-md backdrop-blur-sm'>
              <input
                type='text'
                className='min-h-[50px] text-lg border-gray border-l-2 rounded-sm px-2 py-1 outline-none focus:border-primary hover:border-primary
                placeholder:text-gray transition-all duration-[1s] ease-in-out
                '
                placeholder='Ingresa tu artista ramita andre'
                onChange={handleSearch}
                disabled={isLoading}
              />
              <ul className='overflow-y-scroll flex flex-col gap-2 no-scrollbar'>
                {artistSearch.map(artist => (
                  <li
                    key={artist[1]}
                    className='text-primary bg-dark/85 backdrop-blur-sm px-4 py-2 rounded-sm
                    transition-all duration-100 ease-in-out cursor-pointer 
                    hover:font-bold hover:brightness-110 hover:border-r-2 border-primary
                    '
                    onClick={() => {
                      handleResult(artist[1])
                    }}
                  >
                    {artist[0].replace(/_/g, ' ')}
                  </li>
                ))}
              </ul>
            </search>
          </section>
        </>
      )}
      <section className='w-full h-full relative z-10'>
        <div className='relative w-full h-fullbg-accent  rounded-lg'>
          <Graph
            SetIsLoading={setIsLoading}
            setNodeArtist={setNodeArtist}
            NodeArtist={nodeArtist}
            setNodeHover={setNodeHover}
          />
        </div>
      </section>
    </main>
  )
}

export default App
