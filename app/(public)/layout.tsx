import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Analytics } from "components/Analytics/Analytics"
import { Footer } from "components/Footer/Footer"
import { NavigationWrapper } from "components/Navigation/NavigationWrapper"

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  
  return (
    <>
      <Analytics userId={session?.user?.id} />
      <NavigationWrapper />
      <main className="min-h-screen pt-16">
        {children}
      </main>
      <Footer />
    </>
  )
}