import React from "react";

export function Card({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>{children}</div>;
}

export function CardContent({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props}>{children}</div>;
}

export function CardHeader({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} style={{ paddingBottom: 16 }}>{children}</div>;
}

export function CardTitle({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 {...props} style={{ fontWeight: 600, fontSize: 20, marginBottom: 8 }}>{children}</h3>;
} 