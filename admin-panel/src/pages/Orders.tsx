import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Eye, Download, Filter, ChevronDown, Package, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card'
import { Button } from '@/components/Button'

interface Order {
  id: number
  orderNumber: string
  customer: string
  email: string
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'paid' | 'unpaid' | 'refunded'
  date: string
  items: number
}

const initialOrders: Order[] = [
  { id: 1, orderNumber: 'ORD-2024-001', customer: 'Иван Петров', email: 'ivan@example.com', total: 35998, status: 'delivered', paymentStatus: 'paid', date: '2024-01-15', items: 2 },
  { id: 2, orderNumber: 'ORD-2024-002', customer: 'Мария Сидорова', email: 'maria@example.com', total: 89999, status: 'shipped', paymentStatus: 'paid', date: '2024-01-16', items: 1 },
  { id: 3, orderNumber: 'ORD-2024-003', customer: 'Алексей Козлов', email: 'alexey@example.com', total: 12999, status: 'processing', paymentStatus: 'paid', date: '2024-01-17', items: 1 },
  { id: 4, orderNumber: 'ORD-2024-004', customer: 'Елена Новикова', email: 'elena@example.com', total: 45998, status: 'pending', paymentStatus: 'unpaid', date: '2024-01-18', items: 3 },
  { id: 5, orderNumber: 'ORD-2024-005', customer: 'Дмитрий Волков', email: 'dmitry@example.com', total: 7999, status: 'delivered', paymentStatus: 'paid', date: '2024-01-14', items: 1 },
  { id: 6, orderNumber: 'ORD-2024-006', customer: 'Ольга Морозова', email: 'olga@example.com', total: 124998, status: 'cancelled', paymentStatus: 'refunded', date: '2024-01-13', items: 2 },
  { id: 7, orderNumber: 'ORD-2024-007', customer: 'Сергей Лебедев', email: 'sergey@example.com', total: 29999, status: 'processing', paymentStatus: 'paid', date: '2024-01-18', items: 1 },
  { id: 8, orderNumber: 'ORD-2024-008', customer: 'Наталья Павлова', email: 'natalia@example.com', total: 18998, status: 'shipped', paymentStatus: 'paid', date: '2024-01-17', items: 2 },
]

const statusColors = {
  pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
  processing: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
  shipped: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
  delivered: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  cancelled: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
}

const statusLabels = {
  pending: 'Ожидает',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменен',
}

const paymentStatusColors = {
  paid: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  unpaid: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
  refunded: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
}

const paymentStatusLabels = {
  paid: 'Оплачен',
  unpaid: 'Не оплачен',
  refunded: 'Возвращен',
}

export function Orders() {
  const [orders] = useState<Order[]>(initialOrders)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus
    const matchesPayment = selectedPaymentStatus === 'all' || order.paymentStatus === selectedPaymentStatus
    return matchesSearch && matchesStatus && matchesPayment
  })

  const totalRevenue = filteredOrders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Заказы</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Управление заказами ({filteredOrders.length} из {orders.length})
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-5 h-5 mr-2" />
            Экспорт
          </Button>
          <Button variant="outline">
            <Filter className="w-5 h-5 mr-2" />
            Фильтры
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Всего заказов</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredOrders.length}</p>
              </div>
              <Package className="w-8 h-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Выручка</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₽{totalRevenue.toLocaleString()}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">В обработке</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredOrders.filter(o => o.status === 'pending' || o.status === 'processing').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Отменено</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredOrders.filter(o => o.status === 'cancelled').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Поиск по номеру, клиенту..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                >
                  <option value="all">Все статусы</option>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={selectedPaymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                >
                  <option value="all">Все оплаты</option>
                  {Object.entries(paymentStatusLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-dark-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Заказ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Клиент</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Дата</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Сумма</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Статус</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Оплата</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {filteredOrders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-primary-600 dark:text-primary-400">{order.orderNumber}</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{order.items} тов.</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-gray-900 dark:text-white">{order.customer}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{order.email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.date).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900 dark:text-white">₽{order.total.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${paymentStatusColors[order.paymentStatus]}`}>
                        {paymentStatusLabels[order.paymentStatus]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedOrder(order) }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Заказы не найдены</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-dark-card rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Заказ {selectedOrder.orderNumber}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                  ✕
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Информация о клиенте</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Имя:</span> {selectedOrder.customer}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Email:</span> {selectedOrder.email}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Статус заказа</h3>
                  <div className="space-y-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[selectedOrder.status]}`}>
                      {statusLabels[selectedOrder.status]}
                    </span>
                    <br />
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${paymentStatusColors[selectedOrder.paymentStatus]}`}>
                      {paymentStatusLabels[selectedOrder.paymentStatus]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-dark-border pt-4 mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Товары в заказе</h3>
                <div className="space-y-3">
                  {Array.from({ length: selectedOrder.items }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-2xl">
                          📦
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Товар #{i + 1}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Артикул: ART-{100 + i}</p>
                        </div>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        ₽{(selectedOrder.total / selectedOrder.items).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-dark-border pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Итого:</span>
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    ₽{selectedOrder.total.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedOrder(null)}>
                  Закрыть
                </Button>
                <Button className="flex-1">
                  Изменить статус
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
