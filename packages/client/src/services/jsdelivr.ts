/**
 * Service that will resolve package metadata and resolve
 * package types and package dependencies.
 */

export interface IPackage {
  name: string
  version?: string
  url?: string
  types?: string
}

export interface PackageMetadata {
  name: string
  version: string
  main: string
  types: string
  module: string
  jsdelivr: string
  dependencies: {
    [key: string]: string
  }
}

export async function resolveMetadata(name: string): Promise<Partial<PackageMetadata>> {
  try {
    const data = await fetch(`https://cdn.jsdelivr.net/npm/${name}/package.json`)

    if (data.status !== 200)
      throw new Error('Failed to resolve package metadata')

    return await data.json()
  }
  catch (error) {
    Promise.reject(error)
  }
}

export async function resolveTypes(metadata: Partial<PackageMetadata>): Promise<string> {
  try {
    if (metadata.types) {
      const data = await fetch(`https://cdn.jsdelivr.net/npm/${metadata.name}/${metadata.types}`)

      if (data.status !== 200)
        throw new Error('Failed to resolve package types')

      return await data.text()
    }

    return ''
  }
  catch (error) {
    return ''
  }
}

export async function resolvePackage(name: string): Promise<IPackage[] | undefined> {
  const packages: IPackage[] = []

  try {
    const metadata = await resolveMetadata(name)
    const types = await resolveTypes(metadata)

    packages.push({
      name,
      version: metadata.version,
      url: metadata.module || metadata.main,
      types,
    })

    if (metadata.dependencies) {
      (await Promise.allSettled(Object.keys(metadata.dependencies).map(name => resolvePackage(name))))
        .forEach((result) => {
          if (result.status === 'fulfilled' && result.value)
            packages.push(...result.value)
        })
    }

    return packages.filter((x, index, self) => self.findIndex(t => t.name === x.name) === index)
  }
  catch (error) {

  }
}
