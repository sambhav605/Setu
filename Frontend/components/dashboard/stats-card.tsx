import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  description: string
  icon: LucideIcon
  color: "primary" | "accent" | "success" | "destructive"
}

export function StatsCard({ title, value, description, icon: Icon, color }: StatsCardProps) {
  const colorMap = {
    primary: "bg-primary/10 text-primary border-primary/20",
    accent: "bg-accent/10 text-accent border-accent/20",
    success: "bg-success/10 text-success border-success/20",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
  }

  return (
    <Card className="border-primary/10 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={cn("p-2 rounded-lg border", colorMap[color])}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="pt-2">
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground pt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
