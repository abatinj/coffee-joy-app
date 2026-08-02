import './globals.css';

export const metadata = {
  title: 'Coffee and Joy',
  description: 'POS & Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {/* Tambahkan style global di sini agar berlaku ke semua halaman */}
        <style dangerouslySetInnerHTML={{ __html: `
          /* Semua teks menjadi hitam pekat */
          h1, h2, h3, h4, h5, h6, p, span, div, td, th, li, label, input, select {
            color: #000000 !important;
          }
          
          /* Semua background menjadi krem muda */
          body, .bg-white, .bg-\\[\\#F9F7F4\\], .bg-\\[\\#DCD3C6\\], .bg-gray-100, .bg-gray-50 {
            background-color: #F9F7F4 !important;
          }

          /* Tombol utama tetap coklat agar terlihat profesional */
          .bg-\\[\\#5D4037\\], button.bg-\\[\\#5D4037\\] {
            background-color: #5D4037 !important;
            color: #ffffff !important;
          }
          
          /* Tabel header tetap rapi */
          thead tr, th {
            background-color: #F4F1ED !important;
            color: #000000 !important;
          }

          /* Border halus */
          .border, .border-gray-200, .border-gray-300 {
            border-color: #E5E0D6 !important;
          }
        `}} />
        
        {children}
      </body>
    </html>
  );
}