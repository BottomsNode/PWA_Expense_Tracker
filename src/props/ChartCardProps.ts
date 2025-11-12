import { ReactNode } from "react";

export interface ChartCardProps {
    title: string;
    children: ReactNode;
    className?: string;
    subtitle?: string;
    isLoading?: boolean;
}