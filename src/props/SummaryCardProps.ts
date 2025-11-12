import { ReactNode } from "react"

export interface SummaryCardProps {
    title: string
    value: string
    gradient: string
    icon?: ReactNode
    subtitle?: string
    onClick?: () => void
}
