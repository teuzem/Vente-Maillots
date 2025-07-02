import React from 'react';
import { DollarSign } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const currencies = [
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
];

export const CurrencySwitcher: React.FC = () => {
  const { currency, setCurrency } = useStore();

  const currentCurrency = currencies.find(curr => curr.code === currency);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1">
          <DollarSign className="h-4 w-4" />
          <span className="hidden sm:inline">
            {currentCurrency?.symbol} {currentCurrency?.code}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currencies.map((curr) => (
          <DropdownMenuItem
            key={curr.code}
            onClick={() => setCurrency(curr.code as any)}
            className={`flex items-center gap-2 ${
              currency === curr.code ? 'bg-accent' : ''
            }`}
          >
            <span>{curr.flag}</span>
            <span>{curr.symbol} {curr.code}</span>
            <span className="text-sm text-gray-500">- {curr.name}</span>
            {currency === curr.code && (
              <span className="ml-auto text-xs text-blue-600">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
