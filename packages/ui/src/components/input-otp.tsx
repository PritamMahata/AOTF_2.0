"use client"

import * as React from "react"
import { MinusIcon } from "lucide-react"

import { cn } from "@aotf/lib/utils"

// Minimal context to mimic input-otp API used by our app
type SlotState = {
  char: string | null
  hasFakeCaret: boolean
  isActive: boolean
}

interface OTPContextValue {
  slots: SlotState[]
  activeIndex: number
  setActiveIndex: (index: number) => void
}

const OTPInputContext = React.createContext<OTPContextValue | null>(null)

type InputOTPProps = {
  value: string
  onChange: (value: string) => void
  maxLength: number
  containerClassName?: string
  className?: string
  render: (args: { slots: SlotState[] }) => React.ReactNode
}

function InputOTP({
  className,
  containerClassName,
  value,
  onChange,
  maxLength,
  render,
}: InputOTPProps) {
  const [activeIndex, setActiveIndex] = React.useState<number>(0)
  const hiddenInputRef = React.useRef<HTMLInputElement | null>(null)

  const normalized = (value || "").replace(/\D/g, "").slice(0, maxLength)

  // Compute slots
  const slots: SlotState[] = React.useMemo(() => {
    const chars = normalized.split("")
    const arr: SlotState[] = []
    for (let i = 0; i < maxLength; i++) {
      arr.push({
        char: chars[i] ?? null,
        hasFakeCaret: activeIndex === i && !chars[i],
        isActive: activeIndex === i,
      })
    }
    return arr
  }, [normalized, maxLength, activeIndex])

  // Focus hidden input when slots are clicked
  const focusHidden = () => {
    hiddenInputRef.current?.focus()
  }

  // Determine next active index (first empty or last)
  React.useEffect(() => {
    if (!normalized.length) {
      setActiveIndex(0)
      return
    }
    const firstEmpty = normalized.length
    setActiveIndex(Math.min(firstEmpty, maxLength - 1))
  }, [normalized, maxLength])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key
    if (key === "Backspace") {
      e.preventDefault()
      if (normalized.length === 0) return
      // Remove at current position or previous if current empty
      const idx = activeIndex
      if (idx >= normalized.length) {
        const newVal = normalized.slice(0, -1)
        onChange(newVal)
        setActiveIndex(Math.max(0, newVal.length))
      } else {
        const newVal = normalized.slice(0, Math.max(0, idx)) + normalized.slice(idx + 1)
        onChange(newVal)
        setActiveIndex(Math.max(0, idx - 1))
      }
      return
    }

    if (/^\d$/.test(key)) {
      e.preventDefault()
      if (normalized.length >= maxLength && activeIndex >= maxLength) return

      const chars = normalized.split("")
      if (activeIndex < chars.length) {
        chars[activeIndex] = key
      } else {
        chars.push(key)
      }
      const newVal = chars.join("").slice(0, maxLength)
      onChange(newVal)
      setActiveIndex(Math.min(maxLength - 1, activeIndex + 1))
      return
    }

    if (key === "ArrowLeft") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(0, i - 1))
      return
    }
    if (key === "ArrowRight") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(maxLength - 1, i + 1))
      return
    }
  }

  const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text") || ""
    const digits = text.replace(/\D/g, "").slice(0, maxLength)
    if (digits) {
      onChange(digits)
      setActiveIndex(Math.min(maxLength - 1, digits.length))
    }
  }

  return (
    <div
      data-slot="input-otp"
      className={cn("relative", className)}
      onClick={focusHidden}
    >
      {/* Hidden input to capture keyboard events */}
      <input
        ref={hiddenInputRef}
        inputMode="numeric"
        autoComplete="one-time-code"
        name="one-time-code"
        aria-label="One-time verification code"
        autoCapitalize="off"
        autoCorrect="off"
        className="absolute inset-0 opacity-0 pointer-events-none"
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        value=""
        onChange={() => {}}
      />
      <OTPInputContext.Provider value={{ slots, activeIndex, setActiveIndex }}>
        <div
          className={cn(
            "flex items-center gap-2 has-disabled:opacity-50",
            containerClassName
          )}
        >
          {render({ slots })}
        </div>
      </OTPInputContext.Provider>
    </div>
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center", className)}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? { char: null, hasFakeCaret: false, isActive: false }

  const handleClick = () => {
    inputOTPContext?.setActiveIndex(index)
  }

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      onClick={handleClick}
      className={cn(
        "data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
