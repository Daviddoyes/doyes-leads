'use client';

import { useEffect } from 'react';

import { guardarOrigen } from '@/lib/origen';

export function CapturaOrigen() {
  useEffect(() => {
    guardarOrigen();
  }, []);
  return null;
}
