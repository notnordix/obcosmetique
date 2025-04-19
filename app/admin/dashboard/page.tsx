"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, Users, Eye } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalSubscribers: 0,
    pageViews: 0,
    recentOrders: [],
    recentSubscribers: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/admin/dashboard/stats")

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard stats")
        }

        const data = await response.json()
        setStats(
          data.stats || {
            totalProducts: 0,
            totalOrders: 0,
            totalSubscribers: 0,
            pageViews: 0,
            recentOrders: [],
            recentSubscribers: [],
          },
        )
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Format date for display
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
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
        <p className="text-neutral-500">Welcome to your admin dashboard</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-neutral-500">Products in your catalog</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-neutral-500">Orders received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <Users className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscribers}</div>
            <p className="text-xs text-neutral-500">Newsletter subscribers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pageViews}</div>
            <p className="text-xs text-neutral-500">Total page views</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-sm">
              <Link href="/admin/dashboard/orders">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {stats.recentOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-neutral-500">{order.customerName}</p>
                      <p className="text-xs text-neutral-400">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{Number(order.total).toFixed(2)} MAD</p>
                      <p className={`text-xs ${order.status === "completed" ? "text-green-600" : "text-blue-600"}`}>
                        {order.status === "completed" ? "Completed" : "Processing"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ShoppingCart className="mb-2 h-10 w-10 text-neutral-300" />
                <h3 className="text-lg font-medium text-neutral-600">No orders yet</h3>
                <p className="text-sm text-neutral-500">Orders will appear here when customers make purchases</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Recent Subscribers</CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-sm">
              <Link href="/admin/dashboard/subscribers">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats.recentSubscribers.length > 0 ? (
              <div className="space-y-4">
                {stats.recentSubscribers.map((subscriber: any) => (
                  <div
                    key={subscriber.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{subscriber.email}</p>
                      <p className="text-xs text-neutral-400">{formatDate(subscriber.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="mb-2 h-10 w-10 text-neutral-300" />
                <h3 className="text-lg font-medium text-neutral-600">No subscribers yet</h3>
                <p className="text-sm text-neutral-500">Subscribers will appear here when users join your newsletter</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
