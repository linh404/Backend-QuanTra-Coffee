import QRCode from 'qrcode';

export const generateProductQRCode = async (slug: string) => {
  // Thay domain bằng domain thực tế của bạn khi deploy
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  // URL mới dẫn đến route traceability
  const url = `${baseUrl}/products/${slug}/traceability`;
  
  try {
    const qrImage = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#527a2d', // Màu xanh đặc trưng của bạn
        light: '#FFFFFF',
      },
    });
    return qrImage;
  } catch (err) {
    console.error(err);
    return null;
  }
};