import { useContext } from "react"
import { AdminMsalProviderContext } from "./AdminMsalProviderContext"

export function useAdminMsalProvider() {
    const context = useContext(AdminMsalProviderContext)
    if (!context) {
        throw new Error('useAdminMsalProvider must be used within an AdminMsalProvider')
    }
    return context
}