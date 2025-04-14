import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const port = 3001

app.use(cors())
app.use(express.json())

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
app.get('/api/dashboard', (req, res) => {
  res.json(dashboardData)
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