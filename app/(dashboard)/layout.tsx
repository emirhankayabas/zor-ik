import { redirect } from 'next/navigation';
import { getServerAuthSession } from '@/lib/auth';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ModeToggle } from '@/components/layout/mode-toggle';
import { NotificationBell } from '@/components/layout/notification-bell';
import { DynamicBreadcrumb } from '@/components/layout/dynamic-breadcrumb';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerAuthSession();

    if (!session) {
        redirect('/login');
    }

    return (
        <TooltipProvider>
            <SidebarProvider>
                <AppSidebar session={session} />
                <SidebarInset className="bg-background flex flex-col h-screen">
                    <header className="flex h-14 shrink-0 items-center justify-between px-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="-ml-2 h-8 w-8 text-muted-foreground hover:text-foreground transition-colors" />
                            <Separator orientation="vertical" className="h-4 bg-border/50" />
                            <DynamicBreadcrumb />
                        </div>
                        <div className="flex items-center gap-2">
                            <NotificationBell />
                            <ModeToggle />
                        </div>
                    </header>
                    <main className="flex-1 overflow-y-auto bg-muted/20">
                        <div className="h-full p-6 lg:p-10 max-w-[1400px] mx-auto w-full">
                            {children}
                        </div>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    );
}
