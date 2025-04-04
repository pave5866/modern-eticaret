import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDownIcon,
  QuestionMarkCircleIcon,
  ShieldCheckIcon,
  TruckIcon,
  CreditCardIcon,
  ArrowPathIcon,
  UserIcon,
  ShoppingBagIcon
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

const categories = [
  {
    title: 'Genel',
    icon: QuestionMarkCircleIcon,
    questions: [
      {
        question: 'Nasıl üye olabilirim?',
        answer: 'Sağ üst köşedeki "Üye Ol" butonuna tıklayarak üyelik formunu doldurabilirsiniz. E-posta adresinizi onayladıktan sonra alışverişe başlayabilirsiniz.'
      },
      {
        question: 'Şifremi unuttum, ne yapmalıyım?',
        answer: 'Giriş sayfasındaki "Şifremi Unuttum" linkine tıklayarak e-posta adresinizi girin. Size şifre sıfırlama bağlantısı göndereceğiz.'
      }
    ]
  },
  {
    title: 'Güvenlik',
    icon: ShieldCheckIcon,
    questions: [
      {
        question: 'Ödeme bilgilerim güvende mi?',
        answer: '256-bit SSL sertifikası ile tüm ödeme bilgileriniz şifrelenerek korunmaktadır. Kredi kartı bilgileriniz sistemimizde saklanmaz.'
      },
      {
        question: 'Kişisel verilerim nasıl korunuyor?',
        answer: 'KVKK ve GDPR standartlarına uygun olarak kişisel verileriniz güvenle saklanmakta ve üçüncü taraflarla paylaşılmamaktadır.'
      }
    ]
  },
  {
    title: 'Kargo & Teslimat',
    icon: TruckIcon,
    questions: [
      {
        question: 'Kargo ücreti ne kadar?',
        answer: '150 TL ve üzeri alışverişlerinizde kargo ücretsizdir. 150 TL altındaki siparişlerde 44.99 TL kargo ücreti alınmaktadır.'
      },
      {
        question: 'Ne zaman teslim alabilirim?',
        answer: 'Siparişleriniz ortalama 1-3 iş günü içerisinde teslim edilmektedir. Kargo takip numaranız SMS ve e-posta ile paylaşılacaktır.'
      }
    ]
  },
  {
    title: 'Ödeme',
    icon: CreditCardIcon,
    questions: [
      {
        question: 'Hangi ödeme yöntemlerini kullanabilirim?',
        answer: 'Kredi kartı, banka kartı, havale/EFT ve kapıda ödeme seçeneklerinden birini tercih edebilirsiniz.'
      },
      {
        question: 'Taksit seçenekleri var mı?',
        answer: 'Anlaşmalı bankaların kredi kartlarına 3, 6, 9 ve 12 taksit seçenekleri sunulmaktadır.'
      }
    ]
  },
  {
    title: 'İade & Değişim',
    icon: ArrowPathIcon,
    questions: [
      {
        question: 'İade sürecini nasıl başlatabilirim?',
        answer: 'Hesabım > Siparişlerim bölümünden ilgili ürün için iade talebinde bulunabilirsiniz. İade kargo ücreti firmamıza aittir.'
      },
      {
        question: 'İade süresi ne kadar?',
        answer: 'Ürünleri teslim aldıktan sonra 14 gün içerisinde iade edebilirsiniz. Ürünlerin kullanılmamış ve orijinal ambalajında olması gerekmektedir.'
      }
    ]
  },
  {
    title: 'Üyelik',
    icon: UserIcon,
    questions: [
      {
        question: 'Üyelik avantajları nelerdir?',
        answer: 'Üyelerimiz özel kampanyalardan öncelikli yararlanır, sipariş takibi yapabilir ve puan kazanabilir.'
      },
      {
        question: 'Üyeliğimi nasıl silebilirim?',
        answer: 'Hesap ayarlarınızdan üyelik silme talebinde bulunabilirsiniz. 30 gün içinde hesabınız kalıcı olarak silinecektir.'
      }
    ]
  },
  {
    title: 'Sipariş',
    icon: ShoppingBagIcon,
    questions: [
      {
        question: 'Siparişimi nasıl iptal edebilirim?',
        answer: 'Kargoya verilmemiş siparişlerinizi Hesabım > Siparişlerim bölümünden iptal edebilirsiniz.'
      },
      {
        question: 'Sipariş durumumu nasıl takip edebilirim?',
        answer: 'Hesabım > Siparişlerim bölümünden veya size gönderilen kargo takip numarası ile siparişinizi takip edebilirsiniz.'
      }
    ]
  }
]

function FAQItem({ question, answer, isOpen, onClick }) {
  return (
    <motion.div
      layout
      className="border-b-2 border-gray-100 dark:border-gray-700 last:border-0"
    >
      <button
        onClick={onClick}
        className="flex items-center justify-between w-full py-6 text-left bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700/50 px-6 rounded-lg transition-colors"
      >
        <span className="text-base font-medium text-gray-700 dark:text-white pr-4">
          {question}
        </span>
        <ChevronDownIcon
          className={`w-6 h-6 flex-shrink-0 text-primary-600 dark:text-primary-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-gray-50 dark:bg-gray-800/50"
          >
            <p className="pb-6 px-6 text-base text-gray-600 dark:text-gray-400">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function FAQCategory({ category }) {
  const [openQuestions, setOpenQuestions] = useState(new Set())

  const toggleQuestion = (index) => {
    const newOpenQuestions = new Set(openQuestions)
    if (newOpenQuestions.has(index)) {
      newOpenQuestions.delete(index)
    } else {
      newOpenQuestions.add(index)
    }
    setOpenQuestions(newOpenQuestions)
  }

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden border-2 border-gray-200 dark:border-gray-700"
    >
      <div className="p-6 border-b-2 border-gray-200 dark:border-gray-700 bg-primary-50 dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white dark:bg-primary-900/30 flex items-center justify-center shadow-sm">
            <category.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {category.title}
          </h2>
        </div>
      </div>
      <div className="divide-y-2 divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
        {category.questions.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openQuestions.has(index)}
            onClick={() => toggleQuestion(index)}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default function FAQ() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 py-12 sm:py-16 lg:py-20"
    >
      {/* Hero Section */}
      <motion.div 
        variants={itemVariants}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 dark:text-white mb-6">
          Sıkça Sorulan Sorular
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Aradığınız sorunun cevabını bulamadıysanız, bize iletişim formundan ulaşabilirsiniz.
        </p>
      </motion.div>

      {/* FAQ Categories */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) => (
          <FAQCategory key={index} category={category} />
        ))}
      </div>

      {/* Contact CTA */}
      <motion.div
        variants={itemVariants}
        className="mt-16 text-center bg-primary-50 dark:bg-primary-900/20 rounded-xl p-10 border-2 border-primary-200 dark:border-primary-900/50 shadow-lg"
      >
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
          Başka Sorunuz mu Var?
        </h3>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Size yardımcı olmaktan mutluluk duyarız
        </p>
        <a
          href="/contact"
          className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          Bize Ulaşın
        </a>
      </motion.div>
    </motion.div>
  )
} 