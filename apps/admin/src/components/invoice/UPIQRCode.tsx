import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface UPIQRCodeProps {
  amount: number;
  upiId?: string;
  name?: string;
  currency?: string;
  className?: string;
  size?: number;
}

export const UPIQRCode = ({
  amount,
  upiId,
  name = "",
  currency,
  className,
  size = 200,
}: UPIQRCodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvasRef.current && amount > 0) {
      // Generate UPI payment URL
      const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount.toFixed(2)}&cu=${currency}`;
      // Generate QR code
      QRCode.toCanvas(
        canvasRef.current,
        upiUrl,
        {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        },
        (error: Error | null | undefined) => {
          if (error) {
            console.error('Error generating QR code:', error);
          }
        }
      );
    }
  }, [amount, upiId, name, currency, size]);

  if (amount <= 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <p className="text-gray-400 text-sm text-center">No amount specified</p>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      width={size}
      height={size}
    />
  );
};
