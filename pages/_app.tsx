import React from "react"
import { AppProps } from "next/app";
import GlobalContext from "@/utils/globalContext";
import 'antd/dist/antd.css'
import '../styles/custom.scss'

function MyApp({ Component, pageProps }: AppProps) {
  const [user, setUser] = React.useState(null)

  return (
    <GlobalContext.Provider value={{ user: { get: user, set: setUser } }}>
      <Component {...pageProps} />
    </GlobalContext.Provider>
  )
}

export default MyApp
