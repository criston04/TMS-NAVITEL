/**
 * @fileoverview Página principal del módulo de Programación
 * @module app/(dashboard)/scheduling/page
 * @description Vista principal que integra calendario, sidebar
 * y timeline para programar órdenes de transporte.
 * @author TMS-NAVITEL
 * @version 1.0.0
 */

import { Metadata } from 'next';
import { SchedulingLayout } from '@/components/scheduling';
import { PageWrapper } from '@/components/page-wrapper';

export const metadata: Metadata = {
  title: 'Programación | TMS Navitel',
  description: 'Módulo de programación de órdenes de transporte',
};

/**
 * Página del módulo de programación
 * @returns Componente de la página
 */
export default function SchedulingPage() {
  return (
    <PageWrapper noPadding className="h-full">
      <div className="flex flex-col h-[calc(100vh-3.5rem)]">
        <SchedulingLayout />
      </div>
    </PageWrapper>
  );
}
