import { useState, useEffect, useTransition } from 'react'

function CompoundList() {
  const [compounds, setCompounds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const fetchCompounds = async () => {
      try {
        const response = await fetch('/api/compounds')
        if (!response.ok) {
          throw new Error('Failed to fetch compounds')
        }
        const data = await response.json()
        
        // Use startTransition for state updates that might cause UI lag
        startTransition(() => {
          setCompounds(data)
          setLoading(false)
        })
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchCompounds()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {compounds.map((compound) => (
        <div
          key={compound.id}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{compound.name}</h2>
          <p className="text-gray-600 mb-2">Formula: {compound.formula}</p>
          <p className="text-gray-600">Molecular Weight: {compound.molecularWeight} g/mol</p>
        </div>
      ))}
    </div>
  )
}

export default CompoundList 