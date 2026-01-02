export interface FormValidation {
  minLength?: number
  maxLength?: number
  pattern?: string
  min?: number
  max?: number
  errorMessage: string
}

export interface FormOption {
  value: string
  label: string
  labelNepali?: string
  disabled?: boolean
}

export interface ConditionalDisplay {
  dependsOn: string
  showWhen: string
}

export interface FormField {
  id: string
  name: string
  label: string
  labelNepali: string
  type: "text" | "number" | "select" | "radio" | "checkbox"
  placeholder?: string
  required: boolean
  options?: FormOption[]
  validation?: FormValidation
  conditionalDisplay?: ConditionalDisplay
  dependsOn?: string // For data-dependent selects like Province -> District
}

export interface FormStep {
  stepNumber: number
  stepTitle: string
  stepDescription: string
  icon: string
  fields: FormField[]
}

export interface FormConfig {
  title: string
  subtitle: string
  totalSteps: number
  steps: FormStep[]
  submitButton: {
    text: string
    textNepali: string
    loadingText: string
    successMessage: string
    errorMessage: string
  }
  progressBar: {
    showPercentage: boolean
    showStepIndicator: boolean
    animationDuration: number
    colors: {
      completed: string
      current: string
      upcoming: string
      background: string
    }
  }
}

export interface FormData {
  [key: string]: string | string[]
}
