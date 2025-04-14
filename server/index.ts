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

interface Database {
  insert(url: string, shortURL: string, userName: string): void;
  isMapped(url: string): boolean;
  hasShortUrl(shortURL: string): boolean;
  retrieveLongUrl(shortURL: string): string | undefined;
  lookup(url: string): string | undefined;
  incrementVisit(url: string): void;
  retrieveStats(user: string): Record<string, number>;
}

function initDb(): Database {
  const visits: Record<string, number> = {} // keys are the short URL, values are the number of hits
  const urlMap: Record<string, string> = {} // could use Map
  const userUrls: Record<string, string[]> = {} // could use Map
  
  console.log('--->database ready')

  return {
    insert(url: string, shortURL: string, userName: string) {
      urlMap[url] = shortURL

      userUrls[userName] ??= []
      userUrls[userName].push(url)
      console.log('DB ', url, ' to ', shortURL, `user's urls`, userUrls)
    },

    isMapped(url: string) {
      return url in urlMap
    },

    hasShortUrl(shortURL: string) {
      console.log('DB hasShortUrl values', Object.values(urlMap))
      return Object.values(urlMap).includes(shortURL)
    },

    retrieveLongUrl(shortURL: string) {
      return Object.keys(urlMap).find(key => urlMap[key] === shortURL)
    },

    lookup(url: string) {
      return urlMap[url]
    },

    incrementVisit(url: string) {
      visits[url] ??= 0
      visits[url]++
      console.log('DB ', url, ' ', visits[url], ' visits')
    },

    retrieveStats(user: string) {
      console.log('DB retrieveStats user', user)
      // todo: implement filtering by user
      return {...visits}
    }
  }
}

const db = initDb()

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use(limiter)

// API endpoint to get dashboard data
app.get('/api/dashboard', (req, res) => {
  const { user } = req.query
  console.log('/shorturls GET user', req.query.user, db.retrieveStats(user as string))
  res.json(db.retrieveStats(user as string))
});

// POST create a new short URL
app.post('/api/shorturls', (req, res) => {
  const referer = req.get('referer') || req.get('referrer')
  console.log('/api/shorturls POST referer', referer)
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
  console.log('/api/shorturls POST returning', shortURL)
})

// increment visit
app.post('/api/shorturls/track', (req, res) => {
  const absoluteURL = req.body.absoluteURL
  console.log('/shorturls/track POST absoluteURL', absoluteURL)
  if (db.hasShortUrl(absoluteURL)) {
    db.incrementVisit(absoluteURL)
    const longURL = db.retrieveLongUrl(absoluteURL)
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