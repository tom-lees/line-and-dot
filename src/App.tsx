import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white flex flex-col items-center justify-center p-6">
      <div className="flex space-x-6 mb-6">
        <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
          <img src={viteLogo} className="w-20 h-20 hover:scale-110 transition-transform" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <img src={reactLogo} className="w-20 h-20 hover:scale-110 transition-transform" alt="React logo" />
        </a>
      </div>

      <h1 className="text-4xl font-bold mb-4">Vite + React + Tailwind</h1>

      <div className="bg-white text-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md text-center">
        <button
          onClick={() => setCount((count) => count + 1)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Count is {count}
        </button>
        <p className="mt-4 text-sm">
          Edit <code className="bg-gray-100 px-1 py-0.5 rounded">src/App.tsx</code> and save to test HMR
        </p>
      </div>

      <p className="mt-6 text-sm opacity-80">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
