import * as React from "react"
import * as FormPrimitive from "@radix-ui/react-form"
import {cva, type VariantProps} from "class-variance-authority"

import {cn} from "@/lib/utils"

const formItemVariants = cva("space-y-1")

const formItemLabelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70")

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {hideLabel?: boolean}
>(({className, hideLabel, ...props}, ref) => (
  <div className={cn(formItemVariants(), className)} ref={ref} {...props} />
))
FormItem.displayName = "Form.Item"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof FormPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Label> &
    VariantProps<typeof formItemLabelVariants>
>(({className, ...props}, ref) => (
  <FormPrimitive.Label
    ref={ref}
    className={cn(formItemLabelVariants(), className)}
    {...props}
  />
))
FormLabel.displayName = "Form.Label"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({className, ...props}, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-destructive", className)}
    {...props}
  />
))
FormMessage.displayName = "Form.Message"

const Form = FormPrimitive.Root

const FormField = FormPrimitive.Field

export {Form, FormField, FormItem, FormLabel, FormMessage}
