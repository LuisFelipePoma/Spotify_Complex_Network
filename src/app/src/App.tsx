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

interface CommunitieInfo {
  [key: string]: {
    name: string
    description: string
  }[]
}

const App: React.FC = () => {
  const [nodeArtist, setNodeArtist] = useState<string | null>(null)
  const [nodeHover, setNodeHover] = useState<string | null>(null)
  const [artistIndex, setArtistIndex] = useState<ArtistIndex>({})
  const [artistNames, setArtistNames] = useState<ArtistName>({})
  const [artistSearch, setArtistSearch] = useState<string[][]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [numberCom, setNumberCom] = useState<number | null>(null)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [mouseX, setMouseX] = useState<number>(0)
  const [mouseY, setMouseY] = useState<number>(0)
  const [comunities, setComunities] = useState<CommunitieInfo | null>(null)
  const [comunity, setComunity] = useState<string>('')

  useEffect(() => {
    fetch('/data/comunities.json')
      .then(response => response.json())
      .then(data => setComunities(data))
      .catch(error => console.error('Error fetching ArtistIndex:', error))

    fetch('/data/edges/ArtistW_index.json')
      .then(response => response.json())
      .then(data => {
        setArtistIndex(data)
      })
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX)
      setMouseY(e.clientY)
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <main className='w-full h-[100vh] flex bg-accent relative text-light select-none overflow-hidden'>
      {nodeArtist !== null ? (
        <p className='absolute top-0 right-[40%] z-50 text-center select-none px-4 py-2 bg-accent/80 backdrop-blur-sm rounded-b-md'>
          Artista Seleccionado:{' '}
          <span className='font-bold text-primary text-lg'>
            {getArtistName(artistIndex[nodeArtist])}
          </span>
        </p>
      ) : (
        ''
      )}

      {isLoading && <Loading />}
      {nodeHover && (
        <p
          className='absolute z-50 bg-black bg-opacity-75 text-primary font-bold px-2 py-1 rounded pointer-events-none select-none'
          style={{ top: mouseY + 10, left: mouseX + 10 }}
        >
          <span>{getArtistName(artistIndex[nodeHover])}</span>
        </p>
      )}
      {!isLoading && (
        // Show the search bar
        <>
          <section className='top-5 left-5 z-50 w-[425px] select-none flex flex-col gap-3 absolute'>
            <search className='flex flex-col max-h-[800px] w-[400px] bg-accent/70 rounded-md backdrop-blur-sm'>
              <input
                type='text'
                className='min-h-[50px] text-lg border-gray border-l-2 rounded-sm px-2 py-1 outline-none focus:border-primary hover:border-primary
                bg-accent/80
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
                    className={`
                      text-primary bg-dark/95 backdrop-blur-sm px-4 py-2 rounded-sm
                    transition-all duration-500 ease-out cursor-pointer 
                    hover:border-r-8 border-primary hover:bg-accent/50
                    ${
                      nodeArtist === artist[1]
                        ? 'font-bold border-primary border-r-8'
                        : ''
                    }
                      `}
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

      {!isLoading && (
        <section
          className='absolute z-20 bottom-5 right-5 bg-accent/80 w-[400px] max-h-[850px] 
                   overflow-hidden transition-all duration-700 ease-in rounded-md 
                   backdrop-blur-md'
        >
          <header
            className='flex justify-between w-full select-none cursor-pointer items-center py-4 px-5'
            onClick={() => setIsOpen(!isOpen && comunity != '')}
          >
            <p className='text-primary '>
              Comunidades:{' '}
              <span className='text-white font-semibold'>{numberCom}</span>
            </p>
            <p className='text-primary'>
              Pertenece a:{' '}
              <span className='text-white font-bold'>
                {comunity || 'Ninguna'}
              </span>
            </p>

            <svg
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              width={24}
              height={24}
              strokeWidth={2}
              className='animate-pulse text-primary hover:scale-110 transition-all duration-500 ease-in-out'
            >
              <path d='M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0'></path>
              <path d='M12 9h.01'></path>
              <path d='M11 12h1v4h1'></path>
            </svg>
          </header>

          <div
            className={`transition-all duration-700 ease-in-out text-white overflow-hidden overflow-y-scroll no-scrollbar ${
              isOpen ? 'h-[800px] opacity-100' : 'h-0 opacity-0'
            }`}
          >
            <hr className='border-t-2 border-gray/50 mx-2 ' />
            <section className='flex flex-col gap-5 py-1'>
              {comunity && comunities && (
                <p className='px-2'>
                  {comunities[comunity].map(info => (
                    <article className='flex flex-col justify-between'>
                      <h1 className='text-primary py-1'>{info.name}</h1>
                      <p className='text-sm text-balance py-2'>
                        {info.description}
                      </p>
                      <hr className='border-t-2 border-gray/50' />
                    </article>
                  ))}
                </p>
              )}
            </section>
          </div>
        </section>
      )}
      <section className='w-full h-full relative z-10'>
        <div className='relative w-full h-fullbg-accent  rounded-lg'>
          <Graph
            SetIsLoading={setIsLoading}
            setNodeArtist={setNodeArtist}
            NodeArtist={nodeArtist}
            setNodeHover={setNodeHover}
            setNumberCom={setNumberCom}
            setComunity={setComunity}
          />
        </div>
      </section>
    </main>
  )
}

export default App
