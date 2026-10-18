'use client';

// O Supabase no navegador: só login e leitura do que é da própria conta (RLS).
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_PUBLICO } from '@/lib/config';

let cliente: SupabaseClient | null = null;

export function supabaseNoNavegador(): SupabaseClient {
  cliente ??= createBrowserClient(SUPABASE_PUBLICO.url, SUPABASE_PUBLICO.chave);
  return cliente;
}
