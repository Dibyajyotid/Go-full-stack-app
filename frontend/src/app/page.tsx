import UserInterface from '@/components/UserInterface'
import React from 'react'

const Home: React.FC = () => {
  return (
    <main className='flex flex-wrap items-start justify-center min-h-screen bg-slate-900'>
      <div className='m-4'>
        <UserInterface backendName='go' />
      </div>
    </main>
  )
}

export default Home