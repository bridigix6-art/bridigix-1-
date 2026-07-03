import * as React from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";

export const TooltipProvider = RadixTooltip.Provider;
export const Tooltip = RadixTooltip.Root;
export const TooltipTrigger = RadixTooltip.Trigger;
export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof RadixTooltip.Content>,
  React.ComponentPropsWithoutRef<typeof RadixTooltip.Content>
>(({ children, ...props }, ref) =>
  React.createElement(
    RadixTooltip.Portal,
    null,
    React.createElement(RadixTooltip.Content, { ...props, ref }, children),
  ),
);

TooltipContent.displayName = RadixTooltip.Content.displayName;
