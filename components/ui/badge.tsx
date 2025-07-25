import React from "react";

export function Badge({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} style={{ background: '#eee', borderRadius: 4, padding: '2px 8px', fontSize: 12 }}>{children}</span>;
} 