import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 font-body font-semibold text-body-sm tracking-wide transition-all duration-300 ease-out-expo rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 focus-visible:ring-offset-brand-jet disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-brand-red text-white border border-brand-red shadow-sm hover:bg-brand-red-hover hover:shadow-red-glow hover:-translate-y-0.5 active:translate-y-0 active:shadow-none",
        secondary:
          "bg-brand-graphite text-brand-white border border-brand-ash hover:border-brand-red hover:text-brand-red hover:bg-brand-graphite-light hover:-translate-y-0.5 active:translate-y-0 active:shadow-none",
        ghost:
          "bg-transparent text-brand-smoke border border-transparent hover:text-brand-white hover:bg-brand-graphite/50 hover:border-brand-ash/40 active:bg-brand-graphite",
        outline:
          "bg-transparent text-brand-white border border-brand-ash hover:border-brand-red hover:text-brand-red active:bg-brand-graphite/50",
        danger:
          "bg-transparent text-brand-red border border-brand-red/40 hover:bg-brand-red/10 hover:border-brand-red",
      },
      size: {
        sm: "h-9 px-4 py-2 text-caption",
        md: "h-11 px-6 py-2.5 text-body-sm",
        lg: "h-14 px-8 py-3 text-body-md",
        icon: "h-10 w-10 p-2",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  href?: string;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      href,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const content = (
      <>
        {loading && (
          <svg
            className="h-4 w-4 animate-spin text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {!loading && leftIcon && <span className="flex items-center">{leftIcon}</span>}
        <span>{children}</span>
        {!loading && rightIcon && <span className="flex items-center">{rightIcon}</span>}
      </>
    );

    if (href) {
      return (
        <a
          href={href}
          className={cn(buttonVariants({ variant, size, className }), "no-underline")}
          aria-disabled={isDisabled}
          tabIndex={isDisabled ? -1 : undefined}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };