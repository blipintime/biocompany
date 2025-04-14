import express from 'express'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

dotenv.config()

console.log('--->server dotenv SLUG ROOT', process.env.SLUG_ROOT)

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function initDb() {
  
  const visits = {'abc': 15, 'xyz': 20} // keys are the short URL, values are the number of hits
  const urlMap = {} // could use Map
  const userUrls = {} // could use Map
  
  console.log('--->database ready')

  return {
    insert(url, shortURL, userName) {
      urlMap[url] = shortURL

      userUrls[userName] ??= []
      userUrls[userName].push(url)
      console.log('DB ', url, ' to ', shortURL, `user's urls`, userUrls)
    },

    isMapped(url) {
      return url in urlMap
    },

    hasShortUrl(shortURL) {
      console.log('DB hasShortUrl values', Object.values(urlMap))
      return Object.values(urlMap).includes(shortURL)
    },

    retrieveLongUrl(shortURL) {
      return Object.keys(urlMap).find(key => urlMap[key] === shortURL)
    },

    lookup(url) {
      return urlMap[url]
    },

    incrementVisit(url) {
      visits[url] ??= 0
      visits[url]++
      console.log('DB ', url, ' ', visits[url], ' visits')
    },

    retrieveStats(user) {
      console.log('DB retrieveStats user', user)
      // todo: implement filtering by user
      return {...visits}
    }
  }
}

const db = initDb()

const app = express()
const port = 3001

app.use(cors())
app.use(express.json())
app.use(limiter)

// Sample chemical compounds data
const compounds = [
  {
    id: 1,
    name: 'Water',
    formula: 'H₂O',
    molecularWeight: 18.015
  },
  {
    id: 2,
    name: 'Carbon Dioxide',
    formula: 'CO₂',
    molecularWeight: 44.009
  },
  {
    id: 3,
    name: 'Glucose',
    formula: 'C₆H₁₂O₆',
    molecularWeight: 180.156
  },
  {
    id: 4,
    name: 'Ethanol',
    formula: 'C₂H₅OH',
    molecularWeight: 46.068
  },
  {
    id: 5,
    name: 'Sodium Chloride',
    formula: 'NaCl',
    molecularWeight: 58.443
  },
  {
    id: 6,
    name: 'Sulfuric Acid',
    formula: 'H₂SO₄',
    molecularWeight: 98.079
  }
]

// Sample dashboard data
const dashboardData = [
  {
    url: 'www.yahoo.com',
    visitCount: 15
  },
  {
    url: 'www.cisco.com',
    visitCount: 29
  },
  {
    url: 'www.google.com',
    visitCount: 42
  },
  {
    url: 'www.microsoft.com',
    visitCount: 18
  },
  {
    url: 'www.amazon.com',
    visitCount: 37
  }
]

// API endpoint to get all compounds
app.get('/api/compounds', (req, res) => {
  res.json(compounds)
})

// API endpoint to get dashboard data
app.get('/api/dashboard__old', (req, res) => {
  res.json(dashboardData)
})

app.get('/api/dashboard', (req, res) => {
  const { user } = req.query
  console.log('/shorturls GET user', req.query.user, db.retrieveStats(user))
  res.json(db.retrieveStats(req.query.user))
});

// POST create a new short URL
app.post('/shorturls', (req, res) => {
  const referer = req.get('referer') || req.get('referrer')
  console.log('/shorturls POST referer', referer)
  const { url, user } = req.body
  const slugRoot = process.env.SLUG_ROOT || ''
  let shortURL
  
  if (db.isMapped(url)) {
    shortURL = db.lookup(url)
  } else {
    // generate fake short URL
    shortURL = `${referer}${slugRoot}${Math.random().toString(36).substring(7)}`
    // todo: check if unique before inserting
    db.insert(url, shortURL, user)
  }

  res.json({
    shortURL
  })
  console.log('/shorturls POST data', url, 'returning', shortURL)
})

// increment visit
app.post('/shorturls/track', (req, res) => {
  const pathname = req.body.pathname
  const fullPath = ROOT + pathname
  console.log('/shorturls/track POST fullPath', fullPath)
  if (db.hasShortUrl(fullPath)) {
    db.incrementVisit(fullPath)
    const longURL = db.retrieveLongUrl(fullPath)
    res.json({notFound: false, longURL})
    console.log('/shorturls/track POST returning', {notFound: false, longURL})
  } else {
    // or: res.redirect(status, path); 300, 301, etc.
    // res.redirect('/notfound');
    res.json({notFound: true}) 
  }
})

// Serve static files from the dist directory
app.use(express.static(join(__dirname, '../dist')))

// Handle client-side routing by serving index.html for all non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' })
  }
  
  // Serve index.html for all other routes to support client-side routing
  res.sendFile(join(__dirname, '../dist/index.html'))
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
}) 