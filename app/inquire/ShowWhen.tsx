'use client';

import type { ReactNode } from 'react';
import { useWatch, type Control, type FieldPath, type FieldPathValue } from 'react-hook-form';
import type { InquiryInput } from '@/lib/inquirySchema';

// Renders children only when the gate field passes the predicate. The useWatch
// subscription is local to this component, so changes to the gate field don't
// re-render the entire form.
export function ShowWhen<N extends FieldPath<InquiryInput>>({
  control,
  name,
  when,
  children
}: {
  control: Control<InquiryInput>;
  name: N;
  when: (value: FieldPathValue<InquiryInput, N>) => boolean;
  children: ReactNode;
}) {
  const value = useWatch({ control, name });
  return when(value as FieldPathValue<InquiryInput, N>) ? <>{children}</> : null;
}
