import React from 'react'

interface CardProps {
  title: string;
  content: string;
}

export default function Card({ title, content }: CardProps) {
  return (
    <div className="bg-white border w-full drop-shadow-sm border-gray-200 shadow-sm rounded-xl p-2 md:p-4">
      <p className="text-B3 text-neutral-600">{title}</p>
      <p className="text-S1 text-neutral-950 mt-1">
        {content}
      </p>
    </div>
  );
}
