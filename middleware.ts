import { auth } from "@/auth"
import { NextResponse } from "next/server"
 
export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isApiRoute = req.nextUrl.pathname.startsWith('/api/generate')
  
  if (isApiRoute && !isLoggedIn) {
    return NextResponse.json(
      { error: "Você precisa estar logado para usar esta funcionalidade" },
      { status: 401 }
    )
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: ['/api/generate/:path*']
}