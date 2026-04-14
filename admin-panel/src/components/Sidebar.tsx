import { motion } from 'framer-motion'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  { icon: '📊', label: 'Dashboard', path: '/' },
  { icon: '📦', label: 'Товары', path: '/products' },
  { icon: '🛒', label: 'Заказы', path: '/orders' },
  { icon: '👥', label: 'Клиенты', path: '/customers' },
  { icon: '🏷️', label: 'Маркетинг', path: '/marketing' },
  { icon: '⚙️', label: 'Настройки', path: '/settings' },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border z-50 lg:translate-x-0 lg:static"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-dark-border">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">E-commerce Manager</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin">
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
                <motion.li
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <a
                    href={item.path}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-950 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-dark-border">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <span className="text-primary-600 dark:text-primary-400 font-semibold">A</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Admin User</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">admin@shop.com</p>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
