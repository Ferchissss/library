"use client"

import { useState } from "react"
import { Book, Clock, FileText, Flame, Globe, Heart, Layers, Library, Mountain, Pen, Plus, Sparkles, Star, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {Select, SelectContent, SelectItem, SelectTrigger,SelectValue,} from "@/components/ui/select"
import type { Challenge } from "@/lib/types"
import { getIconColor } from "@/lib/colors"
import { toast } from "sonner"

interface CreateChallengeDialogProps {
  onAdd: (challenge: Challenge) => void
}

export function CreateChallengeDialog({ onAdd }: CreateChallengeDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generatingSQL, setGeneratingSQL] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    icon_name: "",
    description: "",
    goal_value: 0,
    unit: "",
    year: new Date().getFullYear(),
    rule_description: "",
    query_sql: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setGeneratingSQL(true)

    try {
      // 1. FIRST generate the SQL query
      const sqlResponse = await fetch('/api/generate-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          goal_value: formData.goal_value,
          unit: formData.unit,
          year: formData.year,
          rule_description: formData.rule_description
        }),
      })

      const sqlData = await sqlResponse.json()
      
      if (!sqlData.sql) {
        throw new Error('No SQL query received from server')
      }

      setGeneratingSQL(false)

      // 2. THEN insert into Supabase with the generated query
      const challengeData = {
        name: formData.name,
        icon_name: formData.icon_name,
        description: formData.description,
        goal_value: formData.goal_value,
        unit: formData.unit,
        year: formData.year,
        rule_description: formData.rule_description,
        query_sql: sqlData.sql
      }

      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(challengeData),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || 'Error creating challenge in database')
      }

      const newChallenge: Challenge = responseData
      
      // Call callback with new challenge
      onAdd(newChallenge)
      
      // Reset form and close dialog
      setFormData({
        name: "",
        icon_name: "",
        description: "",
        goal_value: 0,
        unit: "",
        year: new Date().getFullYear(),
        rule_description: "",
        query_sql: ""
      })
      setOpen(false)
      
      // Show success toast
      toast.success("Challenge created successfully", {
        description: `"${formData.name}" has been added to your challenges`
      })
      
    } catch (error) {
      console.error('Error creating challenge:', error)
      toast.error("Error creating challenge", {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setLoading(false)
      setGeneratingSQL(false)
    }
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const iconOptions = [
    { value: "Book", label: "Reading", icon: Book },
    { value: "Layers", label: "Genres", icon: Layers },
    { value: "Globe", label: "Languages", icon: Globe },
    { value: "Clock", label: "Eras", icon: Clock },
    { value: "FileText", label: "Stories", icon: FileText },
    { value: "Flame", label: "Intense Challenge", icon: Flame },
    { value: "Star", label: "Favorites", icon: Star },
    { value: "Trophy", label: "Competitive", icon: Trophy },
    { value: "Pen", label: "Writing", icon: Pen },
    { value: "Library", label: "Collection", icon: Library },
    { value: "Mountain", label: "Overcoming", icon: Mountain },
    { value: "Heart", label: "Passion", icon: Heart },
    { value: "Sparkles", label: "Creativity", icon: Sparkles },
  ]

  const unitOptions = [
    { value: "books", label: "Books" },
    { value: "pages", label: "Pages" },
    { value: "minutes", label: "Minutes" },
    { value: "days", label: "Days" },
    { value: "genres", label: "Genres" },
    { value: "authors", label: "Authors" },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-600 hover:bg-orange-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Challenge
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-3xl font-bold text-orange-800 mb-2">Create New Challenge</DialogTitle>
          <DialogDescription className="text-orange-600">
            Add a new reading challenge to maintain your motivation.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-orange-700 font-medium w-24">Challenge Name</Label>
            <Input
              id="name"
              value={formData.name}
              className="border-orange-200 focus:border-orange-400 focus:ring-orange-400 py-2 h-7"
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon_name" className="text-orange-700 font-medium w-24">Icon</Label>
            <Select value={formData.icon_name} onValueChange={(value) => handleChange("icon_name", value)}>
              <SelectTrigger className="border-orange-200 focus:border-orange-400 focus:ring-orange-400 py-2 h-7">
                <SelectValue placeholder="Select an icon" />
              </SelectTrigger>
              <SelectContent className="border-orange-200">
                {iconOptions.map(({ value, label, icon: Icon }) => {
                  const iconColor = getIconColor(value)
                  return (
                    <SelectItem key={value} value={value} className="focus:bg-orange-50">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5" style={{ color: iconColor }} />
                        <span className="text-orange-900">{label}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-orange-700 font-medium w-24">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="border-orange-200 focus:border-orange-400 focus:ring-orange-400 py-1"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="goal_value" className="text-orange-700 font-medium w-24">Goal</Label>
              <Input
                id="goal_value"
                type="number"
                value={formData.goal_value || ""}
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-400 py-2 h-7"
                onChange={(e) =>handleChange("goal_value", e.target.value ? +e.target.value : "")}
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit" className="text-orange-700 font-medium w-24">Unit</Label>
              <Input
                id="unit"
                value={formData.unit}
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-400 py-2 h-7"
                onChange={(e) => handleChange("unit", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year" className="text-orange-700 font-medium w-24">Year</Label>
            <Input
              id="year"
              type="number"
              value={formData.year}
              className="border-orange-200 focus:border-orange-400 focus:ring-orange-400 py-2 h-7"
              onChange={(e) => handleChange("year", parseInt(e.target.value) || new Date().getFullYear())}
              min="2000"
              max="2030"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rule_description" className="text-orange-700 font-medium w-24">Rules (Optional)</Label>
            <Textarea
              id="rule_description"
              value={formData.rule_description}
              onChange={(e) => handleChange("rule_description", e.target.value)}
              className="border-orange-200 focus:border-orange-400 focus:ring-orange-400 py-1"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-orange-200 text-orange-700 hover:bg-orange-50"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-orange-600 hover:bg-orange-700"
              disabled={loading || generatingSQL}
            >
              {generatingSQL ? "Generating SQL..." : loading ? "Creating..." : "Create Challenge"}
            </Button>
            {generatingSQL && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                <p className="text-sm text-orange-700 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generating SQL query with AI...
                </p>
              </div>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}