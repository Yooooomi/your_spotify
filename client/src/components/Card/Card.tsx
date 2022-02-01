import React from 'react';

interface CardProps {
  top: React.ReactNode;
  middle: React.ReactNode;
  bottom: React.ReactNode;
}

export default function Card({ top, middle, bottom }: CardProps) {
  return (
    <div>
      <div>{top}</div>
      <div>{middle}</div>
      <div>{bottom}</div>
    </div>
  );
}
