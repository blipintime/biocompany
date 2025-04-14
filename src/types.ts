export interface Compound {
  id: number
  name: string
  formula: string
  molecularWeight: number
}

export interface SiteData {
  url: string
  visitCount: number
}

export interface SiteVisitMap {
  [key: string]: number
} 