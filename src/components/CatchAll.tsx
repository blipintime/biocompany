import React, { useEffect,useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

const CatchAll: React.FC = () => {

  const [notFound, setNotFound] = useState(false)
  const location = useLocation()
  const isInitialized = useRef(false)

  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true

    const apiUrl = '/api/shorturls/track'
    
    const { protocol, hostname, port } = window.location
    const dataToSend = {
      absoluteURL: `${protocol}//${hostname}:${port}${location.pathname}`
    }

    console.log('---->Catchall', dataToSend)

    try {
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Indicate that we are sending JSON data
        },
        body: JSON.stringify(dataToSend), // Convert the JavaScript object to a JSON string
      }).then(r => {
        return r.json()
      }).then(response => {
        console.log('Success:', response)
        setNotFound(response.notFound)
        if (!response.notFound && response.longURL) {
          window.location.href = response.longURL
        }
      }).catch(response => {
        response.json().then(errorData => {
          console.error('Error data:', errorData);
        })
      })
      // You can now work with the responseData
    } catch (error) {
      // Handle network errors or other exceptions
      console.error('There was an error sending the request:', error);
    }
  }, [])

  return (
    <div className="flex justify-center items-center h-64">
      <h1 className="text-3xl font-bold text-gray-800">
      {notFound ? <span>404 Not found</span> : <span>Everything ok. Visit tracked. Redirecting...</span>}
      </h1>
    </div>
  )
}

export default CatchAll 