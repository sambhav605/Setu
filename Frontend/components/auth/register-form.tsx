"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { Scale, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react"

export function RegisterForm() {
  const { login, updateUserDetails } = useAuth()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    nid: "",
    age: "",
    education: "",
    salary: "",
    hasDisability: "no",
    disabilityType: "",
    province: "",
    district: "",
    municipality: "",
    ward: "",
  })
  const router = useRouter()
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(formData.email)
      await updateUserDetails({
        nid: formData.nid,
        age: Number.parseInt(formData.age),
        education: formData.education,
        salary: formData.salary,
        disability: {
          hasDisability: formData.hasDisability === "yes",
          type: formData.disabilityType,
        },
        address: {
          province: formData.province,
          district: formData.district,
          municipality: formData.municipality,
          ward: formData.ward,
        },
      })
      toast({
        title: "Registration Successful",
        description: "Welcome to Know Your Rights Nepal!",
      })
      router.push("/dashboard")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong during registration.",
      })
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-primary/20 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-muted">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
      </div>

      <CardHeader className="text-center pt-8">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Scale className="h-6 w-6" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
        <CardDescription>
          Step {step} of 3:{" "}
          {step === 1 ? "Basic Information" : step === 2 ? "Personal Details" : "Address & Disability"}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-4 min-h-[400px]">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name (नाम)</Label>
                <Input
                  name="name"
                  id="name"
                  placeholder="John Doe"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  name="email"
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  name="password"
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nid">NID Number (National ID)</Label>
                  <Input
                    name="nid"
                    id="nid"
                    placeholder="123-456-789"
                    required
                    value={formData.nid}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age (उमेर)</Label>
                  <Input
                    name="age"
                    id="age"
                    type="number"
                    placeholder="25"
                    required
                    value={formData.age}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="education">Education Level (शिक्षा)</Label>
                <Select onValueChange={(val) => handleSelectChange("education", val)} value={formData.education}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent>
                    {["No formal education", "Primary", "Secondary", "Bachelor", "Masters", "PhD"].map((lvl) => (
                      <SelectItem key={lvl} value={lvl}>
                        {lvl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Monthly Salary Range (मासिक आय)</Label>
                <Select onValueChange={(val) => handleSelectChange("salary", val)} value={formData.salary}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select salary range" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Below 15000", "15000-30000", "30000-50000", "50000-100000", "Above 100000"].map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-3">
                <Label>Disability Status (अपाङ्गता)</Label>
                <RadioGroup
                  defaultValue={formData.hasDisability}
                  onValueChange={(val) => handleSelectChange("hasDisability", val)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes">Yes</Label>
                  </div>
                </RadioGroup>
                {formData.hasDisability === "yes" && (
                  <Input
                    name="disabilityType"
                    placeholder="Please specify type of disability"
                    className="mt-2"
                    value={formData.disabilityType}
                    onChange={handleInputChange}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Input
                    name="province"
                    id="province"
                    required
                    value={formData.province}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input
                    name="district"
                    id="district"
                    required
                    value={formData.district}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="municipality">Municipality</Label>
                  <Input
                    name="municipality"
                    id="municipality"
                    required
                    value={formData.municipality}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ward">Ward</Label>
                  <Input name="ward" id="ward" required value={formData.ward} onChange={handleInputChange} />
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between pb-8">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={prevStep}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
          )}
          {step < 3 ? (
            <Button type="button" className="ml-auto bg-primary" onClick={nextStep}>
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" className="ml-auto bg-success hover:bg-success/90">
              <CheckCircle2 className="mr-2 h-4 w-4" /> Complete Registration
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}
