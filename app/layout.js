import './globals.css';

export const metadata = {
  title: 'Coffee and Joy',
  description: 'POS & Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-[#F9F7F4]">
        {/* Tambahkan style global di sini agar berlaku ke semua halaman */}
        <style dangerouslySetInnerHTML={{ __html: `
          /* Semua teks menjadi hitam pekat */
          * { color: #000000 !important; }
          button, .btn-primary, button.bg-\\[\\#5D4037\\] { color: #FFFFFF !important; }
          body, .bg-white, .bg-\\[\\#F9F7F4\\], .bg-\\[\\#DCD3C6\\] { background-color: #F9F7F4 !important; }
          .bg-\\[\\#5D4037\\], button.bg-\\[\\#5D4037\\] { background-color: #5D4037 !important; }
          thead tr, th { background-color: #F4F1ED !important; }
          .border, .border-gray-200, .border-gray-300 { border-color: #E5E0D6 !important; }
        `}} />
        {children}
      </body>
    </html>
  );
}