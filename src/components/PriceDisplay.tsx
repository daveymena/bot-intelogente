'use client'

import { useState, useEffect } from 'react'
import { CurrencyService, CurrencyInfo } from '@/lib/currency-service'
import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface PriceDisplayProps {
  priceInCOP: number
  showConversion?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function PriceDisplay({ 
  priceInCOP, 
  showConversion = true,
  className = '',
  size = 'md'
}: PriceDisplayProps) {
  const [userCurrency, setUserCurrency] = useState<CurrencyInfo>(
    CurrencyService.getCurrencyInfo('COP')!
  )
  const [priceInUserCurrency, setPriceInUserCurrency] = useState(priceInCOP)
  const [priceInUSD, setPriceInUSD] = useState(0)

  useEffect(() => {
    loadCurrency()
  }, [priceInCOP])

  const loadCurrency = async () => {
    try {
      const countryInfo = await CurrencyService.detectUserCountry()
      setUserCurrency(countryInfo.currency)

      // Convertir precio
      const converted = CurrencyService.convertFromCOP(priceInCOP, countryInfo.currency.code)
      setPriceInUserCurrency(converted)

      // Calcular en USD
      const usd = CurrencyService.convertToUSD(converted, countryInfo.currency.code)
      setPriceInUSD(usd)
    } catch (error) {
      console.error('Error loading currency:', error)
    }
  }

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  }

  const formattedPrice = CurrencyService.formatPrice(priceInUserCurrency, userCurrency.code)
  const formattedUSD = CurrencyService.formatPrice(priceInUSD, 'USD')

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`font-bold text-pink-600 ${sizeClasses[size]}`}>
        {formattedPrice}
      </span>
      
      {showConversion && userCurrency.code !== 'USD' && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-sm text-gray-500 cursor-help">
                <Info className="w-4 h-4" />
                <span className="hidden sm:inline">≈ {formattedUSD}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-semibold">Conversión de pago</p>
                <p className="text-xs">Precio local: {formattedPrice}</p>
                <p className="text-xs">Al pagar: {formattedUSD}</p>
                <p className="text-xs text-gray-400">
                  Tasa: 1 USD = {userCurrency.rate.toLocaleString()} {userCurrency.code}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}
