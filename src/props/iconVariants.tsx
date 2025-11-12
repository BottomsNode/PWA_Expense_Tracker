import { ModalType } from "@/types"
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react"

export const iconVariants: Record<ModalType, React.ReactNode> = {
    info: <Info className="w-6 h-6" />,
    success: <CheckCircle2 className="w-6 h-6" />,
    warning: <AlertTriangle className="w-6 h-6" />,
    error: <XCircle className="w-6 h-6" />,
}
