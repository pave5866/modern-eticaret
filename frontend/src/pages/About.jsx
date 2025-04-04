import { motion } from 'framer-motion'
import { 
  UserGroupIcon, 
  TrophyIcon, 
  RocketLaunchIcon, 
  HeartIcon,
} from '@heroicons/react/24/outline'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
}

const stats = [
  {
    title: 'Aktif Kullanıcı',
    value: '10K+',
    icon: UserGroupIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    title: 'Ürün Çeşidi',
    value: '5000+',
    icon: TrophyIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    title: 'Başarılı Teslimat',
    value: '50K+',
    icon: RocketLaunchIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  {
    title: 'Mutlu Müşteri',
    value: '15K+',
    icon: HeartIcon,
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  }
]

export default function About() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 py-8 sm:py-12 lg:py-16"
    >
      {/* Hero Section */}
      <motion.div 
        variants={itemVariants}
        className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 lg:mb-20"
      >
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-4 sm:mb-6">
          Hakkımızda
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
          Modern ve güvenilir alışveriş deneyimi sunmak için çıktığımız bu yolda, müşteri memnuniyetini en üst düzeyde tutarak hizmet vermeye devam ediyoruz.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16 lg:mb-20"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 text-center shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full ${stat.bgColor} flex items-center justify-center mb-3 sm:mb-4`}>
              <stat.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${stat.color}`} />
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
              {stat.value}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {stat.title}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Content */}
      <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
        <motion.div variants={itemVariants} className="space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Vizyonumuz
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            E-ticaret sektöründe öncü ve yenilikçi yaklaşımlarla, müşterilerimize en iyi alışveriş deneyimini sunmayı hedefliyoruz. Teknolojik gelişmeleri yakından takip ederek, kullanıcı dostu platformumuzla müşterilerimizin hayatını kolaylaştırmaya devam edeceğiz.
          </p>
          <div className="pt-2 sm:pt-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
              Değerlerimiz
            </h3>
            <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              <li>Müşteri Memnuniyeti</li>
              <li>Güvenilirlik ve Şeffaflık</li>
              <li>Yenilikçilik</li>
              <li>Kalite Odaklılık</li>
              <li>Sürdürülebilirlik</li>
            </ul>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Misyonumuz
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Müşterilerimize güvenli, hızlı ve keyifli bir alışveriş deneyimi sunarak, e-ticaret sektöründe tercih edilen bir marka olmak. Kaliteli ürün ve hizmetlerimizle müşteri memnuniyetini en üst düzeyde tutmak için çalışıyoruz.
          </p>
          <div className="pt-2 sm:pt-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
              Hedeflerimiz
            </h3>
            <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              <li>Sürekli Gelişim ve İnovasyon</li>
              <li>Müşteri Odaklı Hizmet</li>
              <li>Sürdürülebilir Büyüme</li>
              <li>Dijital Dönüşüme Öncülük</li>
              <li>Toplumsal Fayda Sağlama</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
} 