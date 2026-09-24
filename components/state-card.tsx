'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';

interface StateCardProps {
  label: string;
  value: string | number;
  progress?: number; // 0-100
}

export default function StateCard({ label, value, progress }: StateCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      {progress != null ? (
        <CardContent>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}
