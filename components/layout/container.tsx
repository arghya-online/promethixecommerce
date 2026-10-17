import type { ComponentPropsWithoutRef } from "react";

type ContainerProps = ComponentPropsWithoutRef<"div">;

export function Container({ className, ...props }: ContainerProps) {
  return <div className={className ? `content-width ${className}` : "content-width"} {...props} />;
}
