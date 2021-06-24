/**
 * Service that allows us to search for NPM packages using
 * https://npms.io.
 */

export interface PackageMaintainer {
  username: string
  email: string
}

export interface PackageSearchItem {
  package: {
    name: string
    scope: string
    version: string
    description: string
    keywords: string[]
    date: string
    links: {
      [key: string]: string
    }
    author: {
      name: string
      email: string
    }
    publisher: {
      username: string
      email: string
    }
    maintainers: PackageMaintainer[]
  }
  score: {
    final: number
    detail: {
      quality: number
      popularity: number
      maintenance: number
    }
  }
  searchScore: number
}

export interface PackageSearchResult {
  total: number
  results: Partial<PackageSearchItem>[]
}

export async function searchPackages(query: string): Promise<PackageSearchResult> {
  try {
    const data = await fetch(`https://api.npms.io/v2/search?q=${query}`)

    if (data.status !== 200)
      throw new Error('Bad Search')

    return await data.json()
  }
  catch (error) {
    return {
      total: 0,
      results: [],
    }
  }
}
