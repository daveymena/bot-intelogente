'use client'

import { useState, useEffect } from 'react'
import { Globe, ChevronDown } from 'lucide-react'
import { CurrencyService, CurrencyInfo } from '@/lib/currency-service'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface CurrencySelectorProps {
  onCurrencyChange?: (currency: CurrencyInfo) => void
}

export default function CurrencySelector({ onCurrencyChange }: CurrencySelectorProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyInfo>(
    CurrencyService.getCurrencyInfo('COP')!
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    detectCurrency()
  }, [])

  const detectCurrency = async () => {
    try {
      const countryInfo = await CurrencyService.detectUserCountry()
      setSelectedCurrency(countryInfo.currency)
      onCurrencyChange?.(countryInfo.currency)
    } catch (error) {
      console.error('Error detecting currency:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCurrencyChange = (currency: CurrencyInfo) => {
    setSelectedCurrency(currency)
    CurrencyService.setUserCurrency(currency.code)
    onCurrencyChange?.(currency)
    
    // Recargar la página para aplicar cambios
    window.location.reload()
  }

  const popularCurrencies = [
    CurrencyService.getCurrencyInfo('COP')!,
    CurrencyService.getCurrencyInfo('USD')!,
    CurrencyService.getCurrencyInfo('MXN')!,
    CurrencyService.getCurrencyInfo('ARS')!,
    CurrencyService.getCurrencyInfo('EUR')!,
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{selectedCurrency.code}</span>
          <span className="sm:hidden">{selectedCurrency.symbol}</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
          Moneda de visualización
        </div>
        {popularCurrencies.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => handleCurrencyChange(currency)}
            className={selectedCurrency.code === currency.code ? 'bg-gray-100' : ''}
          >
            <div className="flex items-center justify-between w-full">
              <span className="flex items-center gap-2">
                <span className="font-mono">{currency.symbol}</span>
                <span>{currency.code}</span>
              </span>
              <span className="text-xs text-gray-500">{currency.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
        <div className="px-2 py-1.5 text-xs text-gray-500 border-t mt-1">
          Los pagos se procesan en USD
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
