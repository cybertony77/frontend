export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer" style={{
      width: '100%',
      background: 'transparent',
      padding: '20px 0',
      textAlign: 'center',
      color: '#495057',
      fontWeight: 600,
      fontSize: 16,
      letterSpacing: 0.5,
      borderTop: '2px solid #e9ecef',
      marginTop: 'auto',
      flexShrink: 0
    }}>
      Copyright &copy; {year} - Mr. George Magdy

      <style jsx>{`
        @media (max-width: 768px) {
          .footer {
            font-size: 14px !important;
            padding: 15px 0 !important;
            margin-top: 20px !important;
          }
        }
        @media (max-width: 480px) {
          .footer {
            font-size: 12px !important;
            padding: 10px 0 !important;
          }
        }
      `}</style>
    </footer>
  );
} 