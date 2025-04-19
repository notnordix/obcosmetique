"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ShoppingCart, Eye, Users, Package } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [orderDetails, setOrderDetails] = useState<any | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/admin/orders")

        if (!response.ok) {
          throw new Error("Failed to fetch orders")
        }

        const data = await response.json()
        setOrders(data.orders || [])
      } catch (error) {
        console.error("Error fetching orders:", error)
        toast.error("Failed to load orders")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Fetch order details when an order is selected
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (selectedOrder) {
        try {
          const response = await fetch(`/api/admin/orders/${selectedOrder.id}`)

          if (!response.ok) {
            throw new Error("Failed to fetch order details")
          }

          const data = await response.json()
          setOrderDetails(data.orderDetails || null)
        } catch (error) {
          console.error("Error fetching order details:", error)
          toast.error("Failed to load order details")
        }
      }
    }

    fetchOrderDetails()
  }, [selectedOrder])

  const filteredOrders = orders.filter((order) => {
    // Filter by search term
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase())

    // Filter by status
    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleUpdateStatus = async (orderId: string, newStatus: "processing" | "completed") => {
    try {
      setIsUpdatingStatus(true)

      const response = await fetch("/api/admin/orders/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update order status")
      }

      // Update orders list
      setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))

      // Update selected order if it's the one being updated
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
        setOrderDetails({ ...orderDetails, status: newStatus })
      }

      toast.success(`Order marked as ${newStatus}`)
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Failed to update order status")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number | string) => {
    return Number(amount).toFixed(2) + " MAD"
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
        <h1 className="text-2xl font-bold sm:text-3xl">Orders</h1>
        <p className="text-neutral-500">Manage customer orders</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="search"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <Button type="submit" size="icon" variant="ghost">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredOrders.length > 0 ? (
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-neutral-50 text-left">
                  <th className="px-4 py-3 font-medium">Order ID</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="px-4 py-3 font-medium">{order.id}</td>
                    <td className="px-4 py-3">{order.customerName}</td>
                    <td className="px-4 py-3">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3">{formatCurrency(order.total)}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={order.status === "completed" ? "default" : "outline"}
                        className={
                          order.status === "completed"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                        }
                      >
                        {order.status === "completed" ? "Completed" : "Processing"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(order)}>
                        <Eye className="mr-1 h-4 w-4" /> View
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
          <ShoppingCart className="mb-4 h-16 w-16 text-neutral-300" />
          <h2 className="mb-2 text-xl font-medium text-neutral-700">No Orders Found</h2>
          <p className="max-w-md text-neutral-500">
            {searchTerm || statusFilter !== "all"
              ? "No orders match your search criteria. Try different filters."
              : "When customers place orders, they will appear here."}
          </p>
        </Card>
      )}

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl p-0">
          {selectedOrder && orderDetails && (
            <>
              {/* Header with status badge */}
              <div className="relative bg-gradient-to-r from-[#ba1e29]/10 to-white p-6 border-b">
                <DialogTitle className="text-xl flex items-center gap-2">
                  Order {selectedOrder.id}
                  <Badge
                    className={`ml-2 ${
                      selectedOrder.status === "completed"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-blue-100 text-blue-800 border-blue-200"
                    }`}
                  >
                    {selectedOrder.status === "completed" ? "Completed" : "Processing"}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="mt-1 flex items-center gap-2">
                  <span className="flex items-center">
                    <ShoppingCart className="h-3.5 w-3.5 mr-1 text-neutral-500" />
                    Placed on {formatDate(selectedOrder.createdAt)}
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="font-medium text-[#ba1e29]">{formatCurrency(selectedOrder.total)}</span>
                </DialogDescription>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Information */}
                <div>
                  <h3 className="text-base font-medium flex items-center mb-3">
                    <Users className="h-4 w-4 mr-2 text-neutral-500" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-50 rounded-lg p-4 border">
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase text-neutral-500">Name</p>
                      <p className="font-medium">{selectedOrder.customerName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase text-neutral-500">Email</p>
                      <p className="font-medium">{selectedOrder.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase text-neutral-500">Phone</p>
                      <p>{selectedOrder.phone}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase text-neutral-500">City</p>
                      <p>{selectedOrder.city}</p>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <p className="text-xs font-medium uppercase text-neutral-500">Shipping Address</p>
                      <p>{selectedOrder.address}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="text-base font-medium flex items-center mb-3">
                    <Package className="h-4 w-4 mr-2 text-neutral-500" />
                    Order Items
                  </h3>
                  <div className="rounded-lg overflow-hidden border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-neutral-50 text-left">
                          <th className="px-4 py-3 font-medium">Product</th>
                          <th className="px-4 py-3 font-medium text-center">Quantity</th>
                          <th className="px-4 py-3 font-medium text-right">Price</th>
                          <th className="px-4 py-3 font-medium text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderDetails.items.map((item: any, index: number) => (
                          <tr key={index} className={index !== orderDetails.items.length - 1 ? "border-b" : ""}>
                            <td className="px-4 py-3">
                              <div className="font-medium">{item.productName}</div>
                              <div className="text-xs text-neutral-500">ID: {item.productId}</div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center justify-center min-w-[2rem] h-6 rounded-full bg-neutral-100 px-2 font-medium">
                                {item.quantity}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">{formatCurrency(item.price)}</td>
                            <td className="px-4 py-3 text-right font-medium">
                              {formatCurrency(item.price * item.quantity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Order Summary */}
                    <div className="border-t bg-neutral-50">
                      <div className="p-4 flex justify-between items-center">
                        <span className="font-medium">Total</span>
                        <span className="font-bold text-[#ba1e29]">{formatCurrency(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                    Close
                  </Button>
                  <Button
                    className="bg-[#ba1e29] hover:bg-[#a01824]"
                    onClick={() => {
                      const newStatus = selectedOrder.status === "completed" ? "processing" : "completed"
                      handleUpdateStatus(selectedOrder.id, newStatus)
                    }}
                    disabled={isUpdatingStatus}
                  >
                    {isUpdatingStatus ? (
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Updating...
                      </div>
                    ) : (
                      <>Mark as {selectedOrder.status === "completed" ? "Processing" : "Completed"}</>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
