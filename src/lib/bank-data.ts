export interface Bank {
  id: string;
  name: string;
}

export const COLOMBIAN_BANKS: Bank[] = [
  { id: 'bancolombia', name: 'Bancolombia' },
  { id: 'nequi', name: 'Nequi' },
  { id: 'daviplata', name: 'Daviplata' },
  { id: 'davivienda', name: 'Davivienda' },
  { id: 'banco_bogota', name: 'Banco de Bogotá' },
  { id: 'bbva', name: 'BBVA' },
  { id: 'banco_occidente', name: 'Banco de Occidente' },
  { id: 'banco_popular', name: 'Banco Popular' },
  { id: 'av_villas', name: 'AV Villas' },
  { id: 'scotiabank', name: 'Scotiabank Colpatria' },
  { id: 'itau', name: 'Itaú' },
  { id: 'gnb_sudameris', name: 'GNB Sudameris' },
  { id: 'banco_agrario', name: 'Banco Agrario' },
  { id: 'nubank', name: 'NuBank' },
  { id: 'lulo_bank', name: 'Lulo Bank' },
];

export const ACCOUNT_TYPES = [
  { id: 'ahorros', name: 'Ahorros' },
  { id: 'corriente', name: 'Corriente' },
  { id: 'monedero', name: 'Monedero Digital (Nequi/Daviplata)' },
];

export const COUNTRIES = [
  { id: 'CO', name: 'Colombia' },
  { id: 'US', name: 'Estados Unidos' },
  { id: 'MX', name: 'México' },
  { id: 'ES', name: 'España' },
  { id: 'CL', name: 'Chile' },
  { id: 'PE', name: 'Perú' },
  { id: 'AR', name: 'Argentina' },
  { id: 'EC', name: 'Ecuador' },
  { id: 'VE', name: 'Venezuela' },
  { id: 'PA', name: 'Panamá' },
  { id: 'OT', name: 'Otro país' },
];
