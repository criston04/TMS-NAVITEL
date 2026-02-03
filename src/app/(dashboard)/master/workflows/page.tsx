/**
 * @fileoverview Página de gestión de Workflows
 * @module app/(dashboard)/master/workflows/page
 * @description Permite crear, editar, duplicar y gestionar workflows
 * Integración mediante Layout Master-Detail (Split View)
 */

'use client';

import { PageWrapper } from '@/components/page-wrapper';
import { WorkflowLayout } from '@/components/workflows/workflow-layout';

export default function WorkflowsPage() {
  return (
    <PageWrapper
      noPadding
      className="h-[calc(100vh-65px)] flex flex-col overflow-hidden" 
    >
      <WorkflowLayout className="flex-1" />
    </PageWrapper>
  );
}
