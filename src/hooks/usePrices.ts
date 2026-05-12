'use client'

import useSWR from 'swr'
import { CoinPrice } from '@/types'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function usePrices() {
  const { data, error, isLoading } = useSWR<CoinPrice[]>('/api/prices', fetcher, {
    refreshInterval: 60000, // every 60s
    revalidateOnFocus: false,
    dedupingInterval: 55000,
  })

  return {
    prices: data || [],
    isLoading,
    isError: !!error,
  }
}
