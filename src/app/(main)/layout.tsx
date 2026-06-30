import Sidebar from '@/components/Sidebar'
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/');
  }

  return (
    <div className="main-content">
      <Sidebar />
      <main className="page-content">
        {children}
      </main>
    </div>
  )
}
