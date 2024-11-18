import React from 'react'

const Loading: React.FC = () => {
  return (
    <div className='fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm select-none'>
      <svg
        className='animate-spin h-12 w-12 text-primary mb-4'
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'
      >
        <circle
          className='opacity-25'
          cx='12'
          cy='12'
          r='10'
          stroke='currentColor'
          strokeWidth='4'
        ></circle>
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 018-8v8H4z'
        ></path>
      </svg>
      <p className='text-white text-xl'>
        Calculando las{' '}
        <span className='text-primary font-bold'>comunidades</span> de
        artistas...
      </p>
    </div>
  )
}

export default Loading
