import React from "react";

export function Label({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} className={"block mb-1 font-medium text-gray-700 " + (props.className || "")}>
    {children}
  </label>;
} 