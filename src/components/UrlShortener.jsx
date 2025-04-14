import { useState } from 'react'
//import type { ChangeEvent } from 'react'

const USERS = ['John', 'Mary', 'Gary']

function isValidUrl(string) {
  try {
    new URL(string)
    return true
  } catch (err) {
    console.error('Invalid URL', err)
    return false
  }
}

export default function() {

  const [urlToShorten, setUrlToShorten] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [currentUser, setCurrentUser] = useState(USERS[2])
  const [invalidURL, setInvalidURL] = useState(false)

  const handleInputChange = (event) => {
    setUrlToShorten(event.target.value);
  };

  const handleShortenClick = async () => {
    if (!isValidUrl(urlToShorten)) {
      setInvalidURL(true)
      return // do nothing
    }
    setInvalidURL(false)
    const dataToSend = {
      url: urlToShorten,
      user: currentUser // keep track of which user generated the short URL
    }

    try {
      fetch('/api/shorturls', {
        method: 'POST', // Specify the HTTP method as POST
        headers: {
          'Content-Type': 'application/json', // Indicate that we are sending JSON data
          // You might need other headers depending on the API, e.g., 'Authorization'
        },
        body: JSON.stringify(dataToSend), // Convert the JavaScript object to a JSON string
      }).then(r => {
        return r.json()
      }).then(response => {
        console.log('Success:', response)
        setShortenedUrl(response.shortURL)
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
    setCopySuccess(''); // Reset copy success message
  }

  const handleCopyClick = () => {
    if (shortenedUrl) {
      navigator.clipboard.writeText(shortenedUrl)
        .then(() => {
          setCopySuccess('Copied!');
          setTimeout(() => setCopySuccess(''), 2000); // Clear message after 2 seconds
        })
        .catch((err) => {
          console.error('Failed to copy text: ', err);
          setCopySuccess('Copy failed.');
        });
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-12">
      {currentUser}
      <div className="bg-white p-8 rounded-md shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Enter the URL to shorten
        </h1>
        <div className="mb-4">
          <label htmlFor="url" className="block text-gray-700 text-sm font-bold mb-2">
            URL
          </label>
          <input
            type="url"
            id="url"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="https://www.example.com"
            value={urlToShorten}
            onChange={handleInputChange}
          />
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handleShortenClick}
        >
          Shorten
        </button>
        {invalidURL && <p className="text-red-500">Invalid URL.</p>}
        {shortenedUrl && (
          <div className="mt-6">
            <p className="text-green-500 italic">{copySuccess}</p>
            {shortenedUrl && <p className="text-green-500 italic">Success! Here is your short URL.</p>}
            <div className="flex items-center">
              <a
                href={shortenedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {shortenedUrl}
              </a>
              <button
                className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-3 rounded focus:outline-none focus:shadow-outline flex items-center"
                onClick={handleCopyClick}
                disabled={!shortenedUrl}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M8 5a2 2 0 002-2h2a2 2 0 002 2h2m0 3h.01M4 15h16m-16-1h16m-16-1h16"
                  />
                </svg>
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
