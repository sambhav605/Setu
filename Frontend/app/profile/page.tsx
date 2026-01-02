"use client"

import { useAuth } from "@/context/auth-context"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Shield, Key, Trash2, Download } from "lucide-react"
import { redirect } from "next/navigation"

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth()

  if (isLoading) return null
  if (!user) redirect("/login")

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 p-4 md:p-8 bg-muted/20">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary tracking-tight">Account Settings</h1>
            <p className="text-muted-foreground">Manage your personal information and legal profile.</p>
          </div>

          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="bg-background border">
              <TabsTrigger value="personal" className="data-[state=active]:text-primary">
                <User className="mr-2 h-4 w-4" /> Personal Details
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:text-primary">
                <Key className="mr-2 h-4 w-4" /> Security
              </TabsTrigger>
              <TabsTrigger value="data" className="data-[state=active]:text-primary">
                <Shield className="mr-2 h-4 w-4" /> Data & Privacy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card className="border-primary/10">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>These details are used to provide accurate legal assistance.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" defaultValue={user.name} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" defaultValue={user.email} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nid">NID Number</Label>
                      <Input id="nid" defaultValue={user.details?.nid} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input id="age" type="number" defaultValue={user.details?.age} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/10">
                  <Button className="ml-auto bg-primary">Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card className="border-primary/10">
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your password and authentication methods.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current">Current Password</Label>
                    <Input id="current" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new">New Password</Label>
                    <Input id="new" type="password" />
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/10">
                  <Button className="ml-auto bg-primary">Update Password</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-6">
              <Card className="border-primary/10">
                <CardHeader>
                  <CardTitle>Data Export</CardTitle>
                  <CardDescription>Download a copy of your consultations and personal data.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Export All Data (.json)
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-destructive/20 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>Permanently delete your account and all associated legal data.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-destructive font-medium mb-4">
                    This action is irreversible. All chat history and document analyses will be permanently removed.
                  </p>
                  <Button variant="destructive" onClick={() => logout()}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}
