"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Download, Trash2, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function SubscribersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [subscriberToDelete, setSubscriberToDelete] = useState<string | null>(null)

  // Fetch subscribers from API
  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/admin/subscribers")

        if (!response.ok) {
          throw new Error("Failed to fetch subscribers")
        }

        const data = await response.json()
        setSubscribers(data.subscribers || [])
      } catch (error) {
        console.error("Error fetching subscribers:", error)
        toast.error("Failed to load subscribers")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscribers()
  }, [])

  const filteredSubscribers = subscribers.filter((subscriber) =>
    subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ["Email", "Subscription Date"]
    const csvRows = [
      headers.join(","), // Header row
      ...subscribers.map((subscriber) => {
        const date = new Date(subscriber.createdAt).toLocaleDateString()
        return `${subscriber.email},${date}`
      }),
    ]
    const csvContent = csvRows.join("\n")

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `subscribers_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success("Subscribers exported successfully")
  }

  const handleDeleteSubscriber = (id: string) => {
    setSubscriberToDelete(id)
  }

  const confirmDelete = async () => {
    if (subscriberToDelete) {
      try {
        const response = await fetch("/api/admin/subscribers/delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: subscriberToDelete }),
        })

        if (!response.ok) {
          throw new Error("Failed to delete subscriber")
        }

        setSubscribers(subscribers.filter((sub) => sub.id !== subscriberToDelete))
        toast.success("Subscriber deleted successfully")
      } catch (error) {
        console.error("Error deleting subscriber:", error)
        toast.error("Failed to delete subscriber")
      } finally {
        setSubscriberToDelete(null)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-[#ba1e29]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Subscribers</h1>
          <p className="text-neutral-500">Manage newsletter subscribers</p>
        </div>
        <Button onClick={handleExportCSV} variant="outline" className="shrink-0">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          type="search"
          placeholder="Search subscribers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        <Button type="submit" size="icon" variant="ghost">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {filteredSubscribers.length > 0 ? (
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-neutral-50 text-left">
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Subscription Date</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="border-b">
                    <td className="px-4 py-3">{subscriber.email}</td>
                    <td className="px-4 py-3">{formatDate(subscriber.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteSubscriber(subscriber.id)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" /> Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <Users className="mb-4 h-16 w-16 text-neutral-300" />
          <h2 className="mb-2 text-xl font-medium text-neutral-700">No Subscribers Found</h2>
          <p className="max-w-md text-neutral-500">
            {searchTerm
              ? "No subscribers match your search criteria. Try a different search term."
              : "When users subscribe to your newsletter, they will appear here."}
          </p>
        </Card>
      )}

      <AlertDialog open={!!subscriberToDelete} onOpenChange={() => setSubscriberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this subscriber from your database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
