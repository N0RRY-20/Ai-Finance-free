import { Card, CardContent, CardHeader } from '#/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '#/components/ui/sheet'
import { Skeleton } from '#/components/ui/skeleton'

export function DashboardPendingState() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <Skeleton className="h-5 w-52" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Card
              key={index}
              className="rounded-3xl [--card-spacing:--spacing(4)] sm:rounded-4xl sm:[--card-spacing:--spacing(6)]"
            >
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-1 sm:pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="size-4 rounded-full" />
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-3.5 w-36" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="rounded-3xl [--card-spacing:--spacing(4)] sm:rounded-4xl sm:[--card-spacing:--spacing(6)]">
          <CardHeader className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-8 w-28 shrink-0" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-3 py-1"
              >
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function ChatDrawerLoadingFallback({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-xl"
      >
        <SheetHeader className="shrink-0 border-b p-4 pr-12 sm:p-6 sm:pr-12">
          <SheetTitle>Asisten Keuangan AI</SheetTitle>
          <SheetDescription>Memuat asisten keuangan...</SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 p-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="ml-auto h-10 w-2/3" />
          <Skeleton className="h-20 w-4/5" />
        </div>
      </SheetContent>
    </Sheet>
  )
}
