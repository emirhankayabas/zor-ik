import Link from 'next/link';

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Navbar */}
            <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/tr" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">İK</span>
                        </div>
                        <span className="font-bold text-xl text-gray-900">İK Yönetim</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/tr/login"
                            className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                        >
                            Giriş Yap
                        </Link>
                        <Link
                            href="/tr/register"
                            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            Ücretsiz Başla
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="border-t bg-gray-50 py-12">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">İK</span>
                                </div>
                                <span className="font-bold text-lg">İK Yönetim</span>
                            </div>
                            <p className="text-sm text-gray-600">
                                Modern İK yönetim platformu ile süreçlerinizi dijitalleştirin.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Ürün</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><Link href="/tr" className="hover:text-primary transition-colors">Özellikler</Link></li>
                                <li><Link href="/tr" className="hover:text-primary transition-colors">Fiyatlandırma</Link></li>
                                <li><Link href="/tr" className="hover:text-primary transition-colors">Güvenlik</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Şirket</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><Link href="/tr" className="hover:text-primary transition-colors">Hakkımızda</Link></li>
                                <li><Link href="/tr" className="hover:text-primary transition-colors">Blog</Link></li>
                                <li><Link href="/tr" className="hover:text-primary transition-colors">İletişim</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Destek</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><Link href="/tr" className="hover:text-primary transition-colors">Yardım Merkezi</Link></li>
                                <li><Link href="/tr" className="hover:text-primary transition-colors">Dokümantasyon</Link></li>
                                <li><Link href="/tr" className="hover:text-primary transition-colors">API</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t pt-8 text-center text-sm text-gray-500">
                        © 2026 İK Yönetim Sistemi. Tüm hakları saklıdır.
                    </div>
                </div>
            </footer>
        </div>
    );
}
