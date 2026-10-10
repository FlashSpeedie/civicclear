'use client';

import { AppShell } from '@/components/AppShell';
import { SampleWalkthrough } from '@/components/SampleWalkthrough';

export default function SamplePage() {
  return (
    <AppShell currentStep="sample">
      <SampleWalkthrough />
    </AppShell>
  );
}