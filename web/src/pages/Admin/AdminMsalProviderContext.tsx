import { createContext } from "react";

export const AdminMsalProviderContext = createContext<{ loading: boolean, setLoading: React.Dispatch<React.SetStateAction<boolean>> }>({ loading: true, setLoading: () => { } })
