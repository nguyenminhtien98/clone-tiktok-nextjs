"use Client";

import React, { ReactNode, useEffect, useState } from "react";

export default function ClientOnly({ children }: { children: ReactNode }) {

    const [isClient, setIsClient] = useState(false)
    useEffect(() => { setIsClient(true) }, [])

    return (<> {isClient ? <div>{children}</div> : null} </>)
}