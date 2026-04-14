import { motion } from 'framer-motion'
import { TrendingUp, ShoppingBag, Users, DollarSign } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card'

const stats = [
  {
    title: 'Общий доход',
    value: '₽ 1,234,567',
    change: '+12.5%',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-700',
  },
  {
    title: 'Заказы',
    value: '1,234',
    change: '+8.2%',
    icon: ShoppingBag,
    color: 'from-blue-500 to-indigo-700',
  },
  {
    title: 'Клиенты',
    value: '5,678',
    change: '+15.3%',
    icon: Users,
    color: 'from-purple-500 to-violet-700',
  },
  {
    title: 'Конверсия',
    value: '3.24%',
    change: '+2.1%',
    icon: TrendingUp,
    color: 'from-orange-500 to-red-700',
  },
]

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Обзор показателей вашего магазина
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card variant="elevated" className="relative overflow-hidden">
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
              
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </CardTitle>
                <stat.icon className="w-5 h-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {stat.change} к прошлому месяцу
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity & Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Последние заказы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Заказ #{1000 + i}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Клиент {i}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm">
                      Выполнен
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Популярные товары</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Товар {i}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{100 * i} продаж</p>
                    </div>
                    <span className="text-primary-600 dark:text-primary-400 font-semibold">
                      ₽{(1000 * i).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
