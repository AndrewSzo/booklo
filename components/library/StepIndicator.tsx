'use client'

import { WizardStep, StepStatus } from './types'
import { CheckCircle2, Circle } from 'lucide-react'

interface StepIndicatorProps {
  currentStep: WizardStep
}

interface StepInfo {
  step: WizardStep
  title: string
  description: string
}

const stepInfos: StepInfo[] = [
  {
    step: WizardStep.BASIC_INFO,
    title: 'Podstawowe Informacje',
    description: 'Tytuł książki, autor i szczegóły'
  },
  {
    step: WizardStep.CATEGORIZATION,
    title: 'Kategoryzacja',
    description: 'Status czytania i tagi'
  },
  {
    step: WizardStep.REVIEW,
    title: 'Recenzja i Notatki',
    description: 'Ocena i osobiste notatki'
  }
]

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const getStepStatus = (step: WizardStep): StepStatus => {
    if (step < currentStep) return 'completed'
    if (step === currentStep) return 'current'
    return 'pending'
  }

  const getStepClasses = (status: StepStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-primary text-primary-foreground border-primary'
      case 'current':
        return 'bg-primary/10 text-primary border-primary'
      case 'pending':
        return 'bg-muted text-muted-foreground border-muted-foreground/20'
      case 'error':
        return 'bg-destructive text-destructive-foreground border-destructive'
      default:
        return 'bg-muted text-muted-foreground border-muted-foreground/20'
    }
  }

  const getConnectorClasses = (fromStep: WizardStep, toStep: WizardStep) => {
    const fromStatus = getStepStatus(fromStep)
    const toStatus = getStepStatus(toStep)
    
    if (fromStatus === 'completed' && toStatus === 'completed') {
      return 'bg-primary'
    }
    if (fromStatus === 'completed' && toStatus === 'current') {
      return 'bg-gradient-to-r from-primary to-primary/30'
    }
    return 'bg-muted'
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {stepInfos.map((stepInfo, index) => {
          const status = getStepStatus(stepInfo.step)
          const isLast = index === stepInfos.length - 1

          return (
            <div key={stepInfo.step} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200
                    ${getStepClasses(status)}
                  `}
                >
                  {status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : status === 'current' ? (
                    <Circle className="w-4 h-4 fill-current" />
                  ) : (
                    <span className="text-sm font-medium">{stepInfo.step}</span>
                  )}
                </div>
                
                {/* Step Info */}
                <div className="mt-2 text-center">
                  <div
                    className={`
                      text-sm font-medium transition-colors duration-200
                      ${status === 'current' ? 'text-primary' : 
                        status === 'completed' ? 'text-foreground' : 
                        'text-muted-foreground'}
                    `}
                  >
                    {stepInfo.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    {stepInfo.description}
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 mx-4">
                  <div
                    className={`
                      h-0.5 transition-all duration-200
                      ${getConnectorClasses(stepInfo.step, stepInfos[index + 1].step)}
                    `}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
} 